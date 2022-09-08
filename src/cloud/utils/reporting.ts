import {useState, useEffect} from 'react'
import {isEmpty} from 'lodash'
import amplitude from 'amplitude-js'

import {
  reportPoints as reportPointsAPI,
  Point,
  PointTags,
  PointFields,
} from 'src/cloud/apis/reporting'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD, GIT_SHA, AMPLITUDE_KEY} from 'src/shared/constants'
export {Point, PointTags, PointFields} from 'src/cloud/apis/reporting'

let reportingTags: KeyValue = {}
let reportingPoints = []
let reportDecayTimeout = null
let reportMaxTimeout = null
let campaignInfo = {}

const REPORT_DECAY = 500 // number of miliseconds to wait after last event before sending
const REPORT_MAX_WAIT = 5000 // max number of miliseconds to wait between sends
const REPORT_MAX_LENGTH = 300 // max number of events to queue before sending

interface KeyValue {
  [key: string]: string
}

export const updateReportingContext = (properties: KeyValue) => {
  reportingTags = {...reportingTags, ...properties}

  if (AMPLITUDE_KEY && isFlagEnabled('amplitude')) {
    const inst = amplitude.getInstance()

    if (!inst._isInitialized) {
      inst.init(AMPLITUDE_KEY)
    }

    if (properties.hasOwnProperty('userID')) {
      delete reportingTags.userID
      inst.setUserId(properties.userID)
    }

    inst.setUserProperties(reportingTags)
  }
}

export const toNano = (ms: number) => Math.round(ms * 1000000)

// NOTE: typescript can't follow the API results for flags,
// so we need to convert them to strings here
export const cleanTags = (data: Point): Point => {
  return {
    ...data,
    tags: Object.entries(data.tags).reduce((acc, [key, val]) => {
      if (typeof val === 'boolean') {
        acc[key] = val ? 'true' : 'false'
        return acc
      }

      if (!isNaN(parseFloat(val as any))) {
        acc[key] = '' + val
        return acc
      }

      if (!val) {
        acc[key] = val
        return acc
      }

      acc[key] = String(val).trim()
      return acc
    }, {}),
  }
}

const pooledEvent = ({timestamp, measurement, fields, tags}: Point) => {
  if (isEmpty(fields)) {
    fields = {source: 'ui'}
  }

  reportingPoints.push(
    cleanTags({
      measurement,
      tags: {...reportingTags, ...tags, version: GIT_SHA},
      fields,
      timestamp,
    })
  )

  if (!!reportDecayTimeout) {
    clearTimeout(reportDecayTimeout)
    reportDecayTimeout = null
  }

  if (reportingPoints.length >= REPORT_MAX_LENGTH) {
    if (!!reportMaxTimeout) {
      clearTimeout(reportMaxTimeout)
      reportMaxTimeout = null
    }

    reportPointsAPI({
      points: reportingPoints.slice(),
      campaign: campaignInfo,
    })

    reportingPoints = []

    return
  }

  if (!reportMaxTimeout) {
    reportMaxTimeout = setTimeout(() => {
      reportMaxTimeout = null

      // points already cleared
      if (!reportingPoints.length) {
        return
      }

      clearTimeout(reportDecayTimeout)
      reportDecayTimeout = null

      reportPointsAPI({
        points: reportingPoints.slice(),
        campaign: campaignInfo,
      })

      reportingPoints = []
    }, REPORT_MAX_WAIT)
  }

  reportDecayTimeout = setTimeout(() => {
    reportPointsAPI({
      points: reportingPoints.slice(),
      campaign: campaignInfo,
    })

    reportingPoints = []
  }, REPORT_DECAY)
}

export const gaEvent = (event: string, payload: object = {}) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event,
    ...payload,
  })
}

export const normalizeEventName = (name: string) => {
  if (!name) {
    return 'undefined_event'
  }
  return name
    .toLowerCase()
    .replace(/-| |\)|\(|\.|'|"|=|,|`|\[|\]|;|:|<|>/g, '_') // replace special chars by '_'
    .replace(/^_*([^_].*[^_])_*$/, '$1') // trim '_' char
    .replace(/(_+)/g, '_') // deduplicate '_' char
}

export const event = (
  measurement: string,
  meta: PointTags = {},
  values: PointFields = {}
): void => {
  let time = meta.time ? new Date(meta.time).valueOf() : Date.now()

  if (isNaN(time)) {
    time = Date.now()
  }

  delete meta.time

  if (isFlagEnabled('streamEvents')) {
    /* eslint-disable no-console */
    console.log(`Event:  [ ${measurement} ]`)
    if (Object.keys(meta).length) {
      console.log('tags')
      console.log(
        Object.entries(meta)
          .map(([k, v]) => `        ${k}: ${v}`)
          .join('\n')
      )
      console.log('fields')
      console.log(
        Object.entries(values)
          .map(([k, v]) => `        ${k}: ${v}`)
          .join('\n')
      )
    }
    /* eslint-enable no-console */
  }

  gaEvent(measurement, {...values, ...meta})

  if (AMPLITUDE_KEY && isFlagEnabled('amplitude')) {
    const inst = amplitude.getInstance()

    if (!inst._isInitialized) {
      inst.init(AMPLITUDE_KEY)
    }

    inst.logEvent(measurement, {...values, ...meta})
  }

  pooledEvent({
    timestamp: toNano(time),
    measurement,
    fields: {
      source: 'ui',
      ...values,
    },
    tags: {...meta},
  })
}

export const useLoadTimeReporting = (measurement: string) => {
  const [loadStartTime] = useState(Date.now())
  useEffect(() => {
    event(measurement, {
      time: loadStartTime,
    })
  }, [measurement, loadStartTime])
}

export const updateCampaignInfo = (query: string) => {
  if (CLOUD && isFlagEnabled('rudderstackReporting')) {
    const allowedUtmKeys = ['campaign', 'term', 'source', 'medium', 'content']
    const queryParams = new URLSearchParams(query)
    const info = {}
    queryParams.forEach(function (value, key) {
      if (key.startsWith('utm_')) {
        let param = key.substr(4)
        if (allowedUtmKeys.includes(param)) {
          // Rudder element uses 'name' key for campaign name (see rudder-sdk-js/index.js#L2963)
          if (param === 'campaign') {
            param = 'name'
          }
          info[param] = value
        }
      }
    })
    if (Object.keys(info).length) {
      campaignInfo = info
    }
  }
}

import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {track} from 'rudder-sdk-js'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {CLOUD} from 'src/shared/constants'

export interface Point {
  measurement: string
  fields: PointFields
  tags: PointTags
  timestamp?: number
}

export interface PointTags {
  [key: string]: number | string
}

export interface PointFields {
  [key: string]: number | string
}

export interface PointsBatch {
  points: Array<Point>
  timestamp?: number
  campaign?: object
}

export const reportPoints = (batch: PointsBatch) => {
  if (CLOUD && isFlagEnabled('rudderstackReporting')) {
    try {
      batch.points.forEach(point => {
        track(
          point.measurement,
          point.fields,
          asRudderOptions(point.tags, batch.campaign)
        )
      })
    } catch (error) {
      reportErrorThroughHoneyBadger(error, {
        name: 'rudderstack event reporting',
      })
    }
  }
  if (isFlagEnabled('appMetrics')) {
    try {
      const url = '/api/v2/app-metrics'
      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(batch),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
    } catch (error) {
      // don't want reporting errors to effect user experience
    }
  }
}

const asRudderOptions = (tags: PointTags, campaign: object) => {
  if (Object.keys(campaign).length) {
    // converts tags to generic object so we can put a campaign object as value later
    const options = {}
    for (const key in tags) {
      const value = tags[key]
      if (key !== 'context') {
        options[key] = value
      } else if (typeof value !== 'object') {
        // 'context' is reserved options key and its value must be an object
        // (see processOptionsParam function in rudder-sdk-js/index.js line #20460)
        // so just put the value under different key ie. 'appContext'
        // (see event tracking call in eg. src/shared/apis/queryCache.ts#L116)
        options['appContext'] = value
      } else {
        options[key] = value
      }
    }
    // campaign info is in context object (which is merged in processOptionsParam function in rudder-sdk-js/index.js)
    let context = options['context']
    if (context === null) {
      context = {}
      options['context'] = context
    }
    context['campaign'] = campaign
    return options
  }
  return tags
}

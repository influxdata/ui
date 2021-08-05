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
  const options = {}
  let context = null
  Object.keys(tags).forEach((key: string) => {
    const value = tags[key]
    if (key != 'context') {
      options[key] = value
    } else {
      if (typeof value != 'object') {
        // context is reserved rudder element key and must be object, see rudder-sdk-js (#20463)
        options['appContext'] = value
      } else {
        context = options['context'] = value
      }
    }
  })
  if (Object.keys(campaign).length) {
    if (context == null) {
      context = options['context'] = {}
    }
    context['campaign'] = campaign
  }
  return options
}

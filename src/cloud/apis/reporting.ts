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
}

export const reportPoints = (batch: PointsBatch) => {
  if (CLOUD && isFlagEnabled('rudderstackReporting')) {
    try {
      batch.points.forEach(point => {
        track(point.measurement, point.fields, point.tags)
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

import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {track} from 'rudder-sdk-js'

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

export interface Points {
  points: Array<Point>
  timestamp?: number
}

export const reportPoints = (points: Points) => {
  if (isFlagEnabled('rudderstackReporting')) {
    try {
      points.points.forEach(point => {
        track(point.measurement, point.fields, point.tags)
      })
    } catch (e) {
      // don't want reporting errors to effect user experience
    }
  }
  if (isFlagEnabled('appMetrics')) {
    try {
      const url = '/api/v2/app-metrics'
      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(points),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
    } catch (e) {
      // don't want reporting errors to effect user experience
    }
  }
}

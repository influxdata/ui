// Libraries
import {Client} from '@influxdata/influx'
import {get} from 'lodash'
import {getAPIBasepath} from 'src/utils/basepath'

const basePath = `${getAPIBasepath()}/api/v2`

export const getErrorMessage = (e: any) => {
  let message = get(e, 'response.data.error.message')

  if (!message) {
    message = get(e, 'response.data.error')
  }

  if (!message) {
    message = get(e, 'response.headers.x-influx-error')
  }

  if (!message) {
    message = get(e, 'response.data.message')
  }

  if (!message) {
    message = get(e, 'message')
  }

  if (!message && Array.isArray(e)) {
    const error = e.find(err => err.status >= 400)
    message = get(error, 'data.message')
  }

  if (!message) {
    message = 'unknown error'
  }

  return message
}

export const client = new Client(basePath)

// Libraries
import {Client} from '@influxdata/influx'
import {getAPIBasepath} from 'src/utils/basepath'

const basePath = `${getAPIBasepath()}/api/v2`

export const getErrorMessage = (e: any) => {
  let message = e?.response?.data?.error?.message

  if (!message) {
    message = e?.response?.data?.error
  }

  if (!message) {
    message = e?.response?.headers?.['x-influx-error']
  }

  if (!message) {
    message = e?.response?.data?.message
  }

  if (!message) {
    message = e?.message
  }

  if (!message && Array.isArray(e)) {
    const error = e.find(err => err.status >= 400)
    message = error?.data?.message
  }

  if (!message) {
    message = 'unknown error'
  }

  return message
}

export const client = new Client(basePath)

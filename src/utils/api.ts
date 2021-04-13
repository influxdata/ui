// Libraries
import {Client} from '@influxdata/influx'
import {get} from 'lodash'
import {getAPIBasepath} from 'src/utils/basepath'
import {getMe, Me} from 'src/client/unityRoutes'

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

// TODO(ariel): remove this once the API is integrated
const makeResponse = (status, data) => {
  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getMeQuartz = (): ReturnType<typeof getMe> => {
  // TODO(ariel): remove this once the API is connected
  const me: Me = {
    id: '123',
    email: 'asalem@influxdata.com',
    isRegionBeta: false,
    isOperator: true,
    accountType: 'free',
  }

  return makeResponse(200, me)
}

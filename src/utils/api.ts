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
    account: {
      id: 'account123',
      marketplace: null,
      type: 'free',
      organizations: null,
      deletable: false,
      balance: 0,
      users: [],
      billingContact: {
        companyName: 'Influx',
        email: 'asalem@influxdata.com',
        firstName: 'Ariel',
        lastName: 'Salem',
        country: 'USA',
        street1: '123 Main St',
        city: 'New York',
        subdivision: 'NY',
        postalCode: 30000,
      },
    },
  }

  return makeResponse(200, me)
}

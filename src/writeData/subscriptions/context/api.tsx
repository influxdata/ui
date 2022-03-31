import {CLOUD} from 'src/shared/constants'

let getBrokerSub = null
let GetBrokerSubParams = null
let getBrokerSubs = null
let postBrokerSub = null
let PostBrokerSubParams = null
let putBrokerSub = null
let PutBrokerSubParams = null
let deleteBrokerSub = null
let DeleteBrokerSubParams = null
let getBrokerSubsStatus = null
let GetBrokerSubsStatusParams = null
let putBrokerSubsStatus = null
let PutBrokerSubsStatusParams = null

if (CLOUD) {
  getBrokerSub = require('src/client/subscriptionsRoutes').getBrokerSub
  GetBrokerSubParams = require('src/client/subscriptionsRoutes')
    .GetBrokerSubParams
  getBrokerSubs = require('src/client/subscriptionsRoutes').getBrokerSubs
  postBrokerSub = require('src/client/subscriptionsRoutes').postBrokerSub
  PostBrokerSubParams = require('src/client/subscriptionsRoutes')
    .PostBrokerSubParams
  putBrokerSub = require('src/client/subscriptionsRoutes').putBrokerSub
  PutBrokerSubParams = require('src/client/subscriptionsRoutes')
    .PutBrokerSubParams
  deleteBrokerSub = require('src/client/subscriptionsRoutes').deleteBrokerSub
  DeleteBrokerSubParams = require('src/client/subscriptionsRoutes')
    .DeleteBrokerSubParams
  getBrokerSubsStatus = require('src/client/subscriptionsRoutes')
    .getBrokerSubsStatus
  GetBrokerSubsStatusParams = require('src/client/subscriptionsRoutes')
    .GetBrokerSubsStatusParams
  putBrokerSubsStatus = require('src/client/subscriptionsRoutes')
    .putBrokerSubsStatus
  PutBrokerSubsStatusParams = require('src/client/subscriptionsRoutes')
    .PutBrokerSubsStatusParams
}

export const createAPI = async (subscription: typeof PostBrokerSubParams) => {
  const res = await postBrokerSub(subscription)
  if (res.status != 201) {
    throw new Error(res.data.message)
  }
}

export const updateAPI = async (subscription: typeof PutBrokerSubParams) => {
  const res = await putBrokerSub(subscription)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const deleteAPI = async (id: typeof DeleteBrokerSubParams) => {
  const res = await deleteBrokerSub({id})
  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async () => {
  const res = await getBrokerSubs()
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const getByIDAPI = async (id: typeof GetBrokerSubParams) => {
  const res = await getBrokerSub(id)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
}

export const getStatusAPI = async (id: typeof GetBrokerSubsStatusParams) => {
  const res = await getBrokerSubsStatus(id)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const updateStatusAPI = async (
  status: typeof PutBrokerSubsStatusParams
) => {
  const res = await putBrokerSubsStatus(status)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

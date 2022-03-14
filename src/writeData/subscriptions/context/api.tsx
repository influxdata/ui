import {
  getBrokerSub,
  GetBrokerSubParams,
  getBrokerSubs,
  GetBrokerSubsParams,
  postBrokerSub,
  PostBrokerSubParams,
  putBrokerSub,
  PutBrokerSubParams,
  deleteBrokerSub,
  DeleteBrokerSubParams,
  getBrokerSubsStatus,
  GetBrokerSubsStatusParams,
  putBrokerSubsStatus,
  PutBrokerSubsStatusParams,
} from 'src/client/subscriptionsRoutes'

export const createAPI = async (subscription: PostBrokerSubParams) => {
  const res = await postBrokerSub(subscription)
  if (res.status != 201) {
    throw new Error(res.data.message)
  }
}

export const updateAPI = async (subscription: PutBrokerSubParams) => {
  const res = await putBrokerSub(subscription)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const deleteAPI = async (id: DeleteBrokerSubParams) => {
  const res = await deleteBrokerSub(id)
  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async ({}: GetBrokerSubsParams) => {
  const res = await getBrokerSubs({})
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const getByIDAPI = async (id: GetBrokerSubParams) => {
  const res = await getBrokerSub(id)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
}

export const getStatusAPI = async (id: GetBrokerSubsStatusParams) => {
  const res = await getBrokerSubsStatus(id)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const updateStatusAPI = async (status: PutBrokerSubsStatusParams) => {
  const res = await putBrokerSubsStatus(status)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

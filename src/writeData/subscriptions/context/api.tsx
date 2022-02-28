import {
  getBrokerSub,
  GetBrokerSubParams,
  postBrokerSub,
  PostBrokerSubParams,
  putBrokerSub,
  PutBrokerSubParams,
  deleteBrokerSub,
  DeleteBrokerSubParams,
  getBrokerSubStatus,
  GetBrokerSubStatusParams,
} from 'src/client/nifidRoutes'

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

export const deleteAPI = async (ids: DeleteBrokerSubParams) => {
  const res = await deleteBrokerSub(ids)
  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async (orgID: GetBrokerSubParams) => {
  // check this
  const res = await getBrokerSub(orgID)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

// get by id hasn't worked correctly in oats:
//   export const getByIDAPI = async (id: GetBrokerSubParams) => {
//     const res = await getBrokerSub(ids)
//     if (res.status != 200) {
//       throw new Error(res.data.message)
//     }
//   }

export const getStatusAPI = async (subscription: GetBrokerSubStatusParams) => {
  // check this
  const res = await getBrokerSubStatus(subscription)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

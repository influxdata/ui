import {
  getApiV2Functions,
  deleteApiV2Function,
  postApiV2Function,
  FunctionCreateRequest,
  postApiV2FunctionsTrigger,
  FunctionTriggerRequest,
  patchApiV2Function,
  FunctionUpdateRequest,
  getApiV2FunctionsRuns,
} from 'src/client/managedFunctionsRoutes'

export const createAPI = async (functionCreate: FunctionCreateRequest) => {
  const res = await postApiV2Function({data: functionCreate})

  if (res.status != 201) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const deleteAPI = async (id: string) => {
  const res = await deleteApiV2Function({functionID: id})

  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async (orgID: string) => {
  const res = await getApiV2Functions({query: {orgID}})
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const triggerAPI = async (
  triggerRequest: FunctionTriggerRequest
  // param: string
) => {
  const res = await postApiV2FunctionsTrigger({
    data: triggerRequest,
    // query: {param},
  })

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const updateAPI = async (
  functionID: string,
  updateRequest: FunctionUpdateRequest
) => {
  const res = await patchApiV2Function({functionID, data: updateRequest})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const getRunsAPI = async (functionID: string) => {
  const res = await getApiV2FunctionsRuns({functionID})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data.runs
}

import {
  getApiV2PocFunctions,
  deleteApiV2PocFunction,
  postApiV2PocFunction,
  FunctionCreateRequest,
  postApiV2PocFunctionsTrigger,
  FunctionTriggerRequest,
  patchApiV2PocFunction,
  FunctionUpdateRequest,
  getApiV2PocFunctionsRuns,
} from 'src/client/managedFunctionsRoutes'

export const createAPI = async (functionCreate: FunctionCreateRequest) => {
  const res = await postApiV2PocFunction({data: functionCreate})

  if (res.status != 201) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const deleteAPI = async (id: string) => {
  const res = await deleteApiV2PocFunction({functionID: id})

  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async (orgID: string) => {
  const res = await getApiV2PocFunctions({query: {orgID}})
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const triggerAPI = async (triggerRequest: FunctionTriggerRequest) => {
  const res = await postApiV2PocFunctionsTrigger({
    data: triggerRequest,
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
  const res = await patchApiV2PocFunction({functionID, data: updateRequest})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const getRunsAPI = async (functionID: string) => {
  const res = await getApiV2PocFunctionsRuns({functionID})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data.runs
}

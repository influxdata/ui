import {
  getFunctions,
  deleteFunction,
  postFunction,
  FunctionCreateRequest,
  postFunctionsTrigger,
  FunctionTriggerRequest,
  patchFunction,
  FunctionUpdateRequest,
  getFunctionsRuns,
} from 'src/client/managedFunctionsRoutes'

export const createAPI = async (functionCreate: FunctionCreateRequest) => {
  const res = await postFunction({data: functionCreate})

  if (res.status != 201) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const deleteAPI = async (id: string) => {
  const res = await deleteFunction({functionID: id})

  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async (orgID: string) => {
  const res = await getFunctions({query: {orgID}})
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const triggerAPI = async (triggerRequest: FunctionTriggerRequest) => {
  const res = await postFunctionsTrigger({
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
  const res = await patchFunction({functionID, data: updateRequest})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const getRunsAPI = async (functionID: string) => {
  const res = await getFunctionsRuns({functionID})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data.runs
}

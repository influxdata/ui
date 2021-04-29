import {
  getPocFunctions,
  deletePocFunction,
  postPocFunction,
  FunctionCreateRequest,
  postPocFunctionsTrigger,
  FunctionTriggerRequest,
  patchPocFunction,
  FunctionUpdateRequest,
  getPocFunctionsRuns,
} from 'src/client/managedFunctionsRoutes'

export const createAPI = async (functionCreate: FunctionCreateRequest) => {
  const res = await postPocFunction({data: functionCreate})

  if (res.status != 201) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const deleteAPI = async (id: string) => {
  const res = await deletePocFunction({functionID: id})

  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async (orgID: string) => {
  const res = await getPocFunctions({query: {orgID}})
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const triggerAPI = async (triggerRequest: FunctionTriggerRequest) => {
  const res = await postPocFunctionsTrigger({
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
  const res = await patchPocFunction({functionID, data: updateRequest})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const getRunsAPI = async (functionID: string) => {
  const res = await getPocFunctionsRuns({functionID})

  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data.runs
}

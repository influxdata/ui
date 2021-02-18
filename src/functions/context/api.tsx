import {
  getApiV2Functions,
  deleteApiV2Function,
  postApiV2Function,
  FunctionCreateRequest,
  postApiV2FunctionsTrigger,
  FunctionTriggerRequest,
  patchApiV2Function,
  FunctionUpdateRequest,
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
    //  throw new Error(res.data.message)
    return {
      functions: [
        {
          name: 'functionb',
          id: '1',
          orgID: '0',
          script: 'this is a script',
          url: 'www.url.com',
          description: 'best function ever',
        },
        {
          name: 'functiona',
          id: '2',
          orgID: '0',
          script: 'this is another script',
          url: 'www.url.com',
          description: 'second best function ever',
        },
      ],
    }
  } else {
    return res.data
  }
}

export const triggerAPI = async (triggerRequest: FunctionTriggerRequest) => {
  const res = await postApiV2FunctionsTrigger({data: triggerRequest})

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

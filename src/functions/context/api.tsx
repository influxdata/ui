import {
  getApiV2Functions,
  deleteApiV2Function,
  postApiV2Function,
  FunctionCreateRequest,
} from 'src/client/managedFunctionsRoutes'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const createAPI = async (functionCreate: FunctionCreateRequest) => {
  if (isFlagEnabled('managed-functions')) {
    const res = await postApiV2Function({data: functionCreate})

    if (res.status != 201) {
      throw new Error(res.data.message)
    }
    return res.data
  }
}

export const deleteAPI = async (id: string) => {
  if (isFlagEnabled('managed-functions')) {
    const res = await deleteApiV2Function({functionID: id})

    if (res.status != 204) {
      throw new Error(res.data.message)
    }
  }
}

export const getAllAPI = async (orgID: string) => {
  if (isFlagEnabled('managed-functions')) {
    await getApiV2Functions({query: {orgID}})
    // if (res.status != 200) {
    //   throw new Error(res.data.message)
    // } TODO
    return {
      functions: [
        {
          name: 'functionb',
          id: '1',
          orgID: '0',
          script: 'this is a script',
          url: 'www.url.com',
        },
        {
          name: 'functiona',
          id: '2',
          orgID: '0',
          script: 'this is another script',
          url: 'www.url.com',
        },
      ],
    }
  }
  return {}
}

import {
  setRequestHandler,
  setResponseHandler,
  postSignout,
} from './generatedRoutes'
import {getAPIBasepath} from 'src/utils/basepath'
import {Authorization} from 'src/types'
import {postAuthorization} from 'src/client'


export const createAuthorization = async (
  authorization
): Promise<Authorization> => {
  try {
    const resp = await postAuthorization({
      data: authorization,
    })

    if (resp.status !== 201) {
      throw new Error(resp.data.message)
    }
    
    return resp.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

setRequestHandler((url: string, query: string, init: RequestInit) => {
  return {
    url: `${getAPIBasepath()}${url}`,
    query,
    init,
  }
})

setResponseHandler((status, headers, data) => {
  // if the user is inactive log them out
  // influxdb/http/authentication_middleware.go
  if (status === 403 && data.message === 'User is inactive') {
    postSignout({})
    window.location.href = '/signin'
  }

  return {status, headers, data}
})



export * from './generatedRoutes'

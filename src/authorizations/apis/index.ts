import AJAX from 'src/utils/ajax'
import {Authorization, Auth0Config} from 'src/types'
import {getAPIBasepath} from 'src/utils/basepath'
import {getAuthConnection} from 'src/client/unityRoutes'

export const createAuthorization = async (
  authorization
): Promise<Authorization> => {
  try {
    const {data} = await AJAX({
      method: 'POST',
      url: '/api/v2/authorizations',
      data: authorization,
    })

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getAuth0Config = async (
  redirectTo?: string
): Promise<Auth0Config> => {
  try {
    let url = `${getAPIBasepath()}/api/v2private/oauth/clientConfig`
    if (redirectTo) {
      url = `${getAPIBasepath()}/api/v2private/oauth/clientConfig?redirectTo=${redirectTo}`
    }
    const response = await fetch(url)
    const data = await response.json()

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getConnection = async (email: string): Promise<string> => {
  // FIXME: When #4824 gets fixed. Change encodeURI to encodeURIComponent
  const response = await getAuthConnection({query: {email: encodeURI(email)}})

  if (response.status >= 500) {
    throw new Error(response.data)
  }

  if (response.status === 200) {
    return response.data
  }
}

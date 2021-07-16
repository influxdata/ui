import {Authorization, OAuthClientConfig} from 'src/types'
import {getAPIBasepath} from 'src/utils/basepath'
import {postAuthorization} from 'src/client'
import {getAuthConnection} from 'src/client/unityRoutes'

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

export const getAuth0Config = async (
  redirectTo?: string
): Promise<OAuthClientConfig> => {
  try {
    // TODO(ariel): need to see if there's a way to conditionally add a query parameter to generate this
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

export const getConnection = async (email: string): Promise<string | Error> => {
  const response = await getAuthConnection({
    query: {email: encodeURIComponent(email)},
  })

  if (response.status >= 500) {
    throw new Error(response.data)
  }

  if (response.status === 200) {
    return response.data
  }
}

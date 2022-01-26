import {Authorization} from 'src/types'
import {postAuthorization} from 'src/client'
import {getAuthConnection} from 'src/client/unityRoutes'
import {getOauthClientConfig} from 'src/client/cloudPrivRoutes'
import {OAuthClientConfig} from 'src/client/cloudPrivRoutes'
import {event} from 'src/cloud/utils/reporting'

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

export const createReadOnlyAllAuthorization = async (
  orgID,
  name
): Promise<Authorization> => {
  const authorization: Authorization = {
    orgID,
    description: name,
    permissions: [
      {
        action: 'read',
        resource: {
          type: 'buckets',
          orgID: orgID,
        },
      },
    ],
  }

  try {
    const resp = await postAuthorization({
      data: authorization,
    })

    if (resp.status !== 201) {
      throw new Error(resp.data.message)
    }

    event('Read-only authorization created', {orgID, name})
    return resp.data
  } catch (error) {
    event('Read-only authorization creation failed', {orgID, name})
    console.error(error)
    throw error
  }
}

export const getAuth0Config = async (
  redirectTo?: string
): Promise<OAuthClientConfig> => {
  try {
    let payload = {}
    if (redirectTo) {
      payload = {
        query: {
          redirectTo,
        },
      }
    }
    const resp = await getOauthClientConfig(payload)

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    return resp.data
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

// API Calls
import {getClusters} from 'src/client/unityRoutes'

// Types
import {UnauthorizedError, ServerError} from 'src/identity/apis/auth'

export const fetchClusterList = async () => {
  const response = await getClusters({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data
}

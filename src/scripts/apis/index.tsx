// APIs
import {getScripts, Script} from 'src/client/scriptsRoutes'

// Types
import {
  ServerError,
  UnauthorizedError,
} from 'src/types/error'

export const fetchScripts = async (): Promise<Script[]> => {
  const response = await getScripts({query: {limit: 250}})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }
  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data.scripts
}

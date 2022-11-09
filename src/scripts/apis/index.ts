// APIs
import {
  getScripts,
  getScriptsParams,
  Scripts,
  Params,
} from 'src/client/scriptsRoutes'

// Types
import {ServerError, UnauthorizedError} from 'src/types/error'

export const fetchScripts = async (): Promise<Scripts> => {
  const response = await getScripts({query: {limit: 250}})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }
  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }
  const scripts = response.data as Scripts
  return scripts
}

export const fetchScriptParams = async (scriptID: string): Promise<Params> => {
  const response = await getScriptsParams({scriptID})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }
  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }
  const scriptParams = response.data as Params
  
  return scriptParams
}

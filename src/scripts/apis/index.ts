// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {ServerError, UnauthorizedError} from 'src/types/error'
import {Scripts, Params} from 'src/types/scripts'

let getScripts
let getScriptsParams

if (CLOUD) {
  getScripts = require('src/client/scriptsRoutes').getScripts
  getScriptsParams = require('src/client/scriptsRoutes').getScriptsParams
}

export const fetchScripts = async (): Promise<Scripts> => {
  const response = await getScripts({query: {limit: 250}})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }
  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data
}

export const fetchScriptParams = async (scriptID: string): Promise<Params> => {
  const response = await getScriptsParams({scriptID})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }
  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data
}

// Types
import {ServerError, UnauthorizedError} from 'src/types/error'

// Constants
import {CLOUD} from 'src/shared/constants'

export interface Scripts {
  scripts?: Script[]
}
export interface Script {
  readonly id?: string
  name: string
  description?: string
  orgID: string
  script: string
  language?: ScriptLanguage
  url?: string
  readonly createdAt?: string
  readonly updatedAt?: string
  labels?: string[]
}
export type ScriptLanguage = 'flux' | 'sql'

let getScripts

if (CLOUD) {
  getScripts = require('src/client/scriptsRoutes').getScripts
}

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

import {ReactNode} from 'react'
import {ResourceType} from 'src/types/resources'
import {scriptResourceRegistration} from 'src/dataExplorer/components/resources/types/script'

export const SCRIPT_EDITOR_PARAMS = '?fluxScriptEditor'

export enum LanguageType {
  FLUX = 'flux',
  SQL = 'sql',
  INFLUXQL = 'influxql',
}
export interface ResourceConnectedQuery<T> {
  type: ResourceType
  flux: string
  language: LanguageType
  data: T
}

export interface ResourceRegistration {
  type: ResourceType
  disabled?: boolean
  editor: ReactNode
  init: (...args: string[]) => Promise<ResourceConnectedQuery<any>>
  persist: (
    query: ResourceConnectedQuery<any>
  ) => Promise<ResourceConnectedQuery<any>>
}

interface Resources {
  [type: string]: ResourceRegistration
}

export const RESOURCES: Resources = {
  scripts: scriptResourceRegistration(),
}

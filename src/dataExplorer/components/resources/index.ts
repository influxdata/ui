import {ReactNode} from 'react'
import {ResourceType} from 'src/types/resources'

export const SCRIPT_EDITOR_PARAMS = '?fluxScriptEditor'

export enum LanguageType {
  FLUX = 'flux',
  SQL = 'sql',
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

export const RESOURCES: Resources = {}
// eslint-disable-next-line no-extra-semi
;[require('./types/script')].forEach(mod => {
  mod.default((def: ResourceRegistration) => {
    if (RESOURCES.hasOwnProperty(def.type)) {
      throw new Error(
        `Resource of type [${def.type}] has already been registered`
      )
    }

    RESOURCES[def.type] = {
      ...def,
    }
  })
})

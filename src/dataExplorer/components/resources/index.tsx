import {ReactNode} from 'react'

export enum ResourceTypes {
  'Script' = 'script',
  'Dashboard' = 'dashboard',
  'Notebook' = 'notebook',
  'Task' = 'task',
  'Variable' = 'variable',
}

export interface ResourceConnectedQuery<T> {
  type: ResourceTypes
  flux: string
  data: T
}

export interface ResourceRegistration {
  type: ResourceTypes
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
;[
  require('./types/variable'),
  require('./types/task'),
  require('./types/script'),
  require('./types/cell'),
].forEach(mod => {
  mod.default((def: ResourceRegistration) => {
    if (RESOURCES.hasOwnProperty(def.type)) {
      throw new Error(`Pipe of type [${def.type}] has already been registered`)
    }

    RESOURCES[def.type] = {
      ...def,
    }
  })
})

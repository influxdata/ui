import {ReactNode} from 'react'

export enum ResourceTypes {
  'Script' = 'script',
  'Dashboard' = 'dashboard',
  'Notebook' = 'notebook',
  'Task' = 'task',
  'Variable' = 'variable',
}

interface ResourceConnectedQuery<T> {
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

const context = require.context(
  './types',
  true,
  /^\.\/([^\/])+\/index\.(ts|tsx)$/
)

context.keys().forEach(k => {
  const mod = context(k)
  mod.default((def: ResourceRegistration) => {
    if (RESOURCES.hasOwnProperty(def.type)) {
      throw new Error(`Pipe of type [${def.type}] has already been registered`)
    }

    RESOURCES[def.type] = {
      ...def,
    }
  })
})

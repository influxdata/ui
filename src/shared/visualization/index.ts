import {VisTypeRegistration} from 'src/types'
interface VisTypeRegistrationMap {
  [key: string]: VisTypeRegistration
}

export const TYPE_DEFINITIONS: VisTypeRegistrationMap = {}

const context = require.context('./types', true, /index\.(ts|tsx)$/)
context.keys().forEach(key => {
  const module = context(key)
  module.default((def: VisTypeRegistration) => {
    TYPE_DEFINITIONS[def.type] = def
  })
})
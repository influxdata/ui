import {TypeRegistration} from 'src/types/flows'

export interface TypeLookup {
  [key: string]: TypeRegistration
}

export const PIPE_DEFINITIONS: TypeLookup = {}

// NOTE: this loads in all the modules under the current directory
// to make it easier to add new types
const context = require.context(
  './pipes',
  true,
  /^\.\/([^\/])+\/index\.(ts|tsx)$/
)
context.keys().forEach(key => {
  const module = context(key)
  module.default((definition: TypeRegistration) => {
    if (PIPE_DEFINITIONS.hasOwnProperty(definition.type)) {
      throw new Error(
        `Pipe of type [${definition.type}] has already been registered`
      )
    }

    PIPE_DEFINITIONS[definition.type] = {
      ...definition,
    }
  })
})

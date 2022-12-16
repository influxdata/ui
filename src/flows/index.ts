import {TypeRegistration} from 'src/types/flows'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

export interface TypeLookup {
  [key: string]: TypeRegistration
}

export const UNPROCESSED_PANEL_TEXT =
  'This cell will display results from the previous cell after selecting Run.'

export const PIPE_DEFINITIONS: TypeLookup = {}
export const NOTEBOOKS_DOCUMENTATION_LINK = `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/notebooks/create-notebook/`

export {
  PROJECT_NAME,
  DEFAULT_PROJECT_NAME,
  PROJECT_NAME_SHORT,
  PROJECT_NAME_PLURAL,
} from 'src/flows/constants'

// NOTE: this loads in all the modules under the current directory
// to make it easier to add new types
const context = require.context(
  './pipes',
  true,
  /^\.\/([^\/])+\/index\.(ts|tsx)$/
)
context.keys().forEach(async key => {
  const module = await context(key)
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

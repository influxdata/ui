import {TypeRegistration} from 'src/types/flows'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

export interface TypeLookup {
  [key: string]: TypeRegistration
}

export const UNPROCESSED_PANEL_TEXT =
  'This cell will display results from the previous cell after selecting Run.'

export const PIPE_DEFINITIONS: TypeLookup = {}
export const PROJECT_NAME: string = 'Notebook'
export const DEFAULT_PROJECT_NAME: string = `Untitled ${PROJECT_NAME}`
export const PROJECT_NAME_SHORT: string = 'Books'
export const PROJECT_NAME_PLURAL: string = `${PROJECT_NAME}s`

export const NOTEBOOKS_DOCUMENTATION_LINK = `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/notebooks/create-notebook/`

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

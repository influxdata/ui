export interface TelegrafPlugin {
  id: string
  name: string
  url: string
  image?: string
  markdown?: string
}

export interface CodeSampleOption {
  title: string // text to describe the option
  code: string // the code
}

export interface ClientRegistration {
  id: string // a unique string that identifies a client

  name: string // a human readable string for the client
  description?: string // the client detail's preamble, as a markdown string
  logo: string // and SVG string to display for the client

  initialize?: string | CodeSampleOption[] // code representing initializing the client library
  write?: string | CodeSampleOption[] // code representing different ways of writing to the backend with the client
  execute?: string | CodeSampleOption[] // code representing how a user would execute a query with the client library

  featureFlag?: string // designates a flag that should enable the client

  query?: string // Query to be rendered for examples
}

interface ClientLookup {
  [id: string]: ClientRegistration
}

export const CLIENT_DEFINITIONS: ClientLookup = {}
export const searchClients = (term: string): ClientRegistration[] =>
  Object.values(CLIENT_DEFINITIONS)
    .filter(item => item.name.toLowerCase().includes(term.toLowerCase()))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

const context = require.context(
  './clients',
  true,
  /^\.\/([^\/])+\/index\.(ts|tsx)$/
)
context.keys().forEach(key => {
  const module = context(key)

  module.default((definition: ClientRegistration) => {
    if (CLIENT_DEFINITIONS.hasOwnProperty(definition.id)) {
      // NOTE: this only happens at compile time, check your webpack confs
      throw new Error(
        `Client of type [${definition.id}] has already been registered`
      )
    }

    CLIENT_DEFINITIONS[definition.id] = {
      ...definition,
    }
  })
})

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
  execute?: string | CodeSampleOption[] // code representing how a user would execute a query snipped with the client library
  executeFull?: string | CodeSampleOption[] // code representing how a user would initialize & execute a query with the client library
  dispose?: string | CodeSampleOption[] // code representing disposing the client library

  featureFlag?: string // designates a flag that should enable the client

  query?: string // Query to be rendered for examples
  querySanitize?: (query: string) => string // function to sanitize Flux query
}

interface ClientLookup {
  [id: string]: ClientRegistration
}

import {Client as Arduino} from './clients/Arduino'
import {Client as CSharp} from './clients/CSharp'
import {Client as Dart} from './clients/Dart'
import {Client as Go} from './clients/Go'
import {Client as Java} from './clients/Java'
import {Client as NodeJS} from './clients/Javascript'
import {Client as Kotlin} from './clients/Kotlin'
import {Client as PHP} from './clients/PHP'
import {Client as Python} from './clients/Python'
import {Client as R} from './clients/R'
import {Client as Ruby} from './clients/Ruby'
import {Client as Scala} from './clients/Scala'
import {Client as Swift} from './clients/Swift'

export const CLIENT_DEFINITIONS: ClientLookup = {
  arduino: new Arduino(),
  csharp: new CSharp(),
  dart: new Dart(),
  go: new Go(),
  java: new Java(),
  'javascript-node': new NodeJS(),
  kotlin: new Kotlin(),
  php: new PHP(),
  python: new Python(),
  r: new R(),
  ruby: new Ruby(),
  scala: new Scala(),
  swift: new Swift(),
}

export const searchClients = (term: string): ClientRegistration[] =>
  Object.values(CLIENT_DEFINITIONS)
    .filter(item => item.name.toLowerCase().includes(term.toLowerCase()))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

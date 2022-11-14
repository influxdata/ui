import {EndpointTypeRegistration} from 'src/types'

export const TEST_NOTIFICATION = 'This is a test notification'

export interface TypeLookup {
  [key: string]: EndpointTypeRegistration
}
export const ENDPOINT_DEFINITIONS: TypeLookup = {}
export const ENDPOINT_ORDER = [
  'slack',
  'http',
  'pagerduty',
  'sendgrid',
  'aws',
  'mailjet',
  'mailgun',
  'discord',
  'opsgenie',
  'pushbullet',
  'teams',
  'telegram',
  'sensu',
  'zenoss',
]

// NOTE: this loads in all the modules under the current directory
// to make it easier to add new types
const context = require.context(
  './endpoints',
  true,
  /^\.\/([^\/])+\/index\.(ts|tsx)$/
)
context.keys().forEach(async key => {
  const module = await context(key)
  module.default((definition: EndpointTypeRegistration) => {
    if (ENDPOINT_DEFINITIONS.hasOwnProperty(definition.type)) {
      throw new Error(
        `Endpoint of type [${definition.type}] has already been registered`
      )
    }

    ENDPOINT_DEFINITIONS[definition.type] = {
      ...definition,
    }
  })
})

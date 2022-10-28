import {EndpointTypeRegistration} from 'src/types'

export const TEST_NOTIFICATION = 'This is a test notification'

export interface TypeLookup {
  [key: string]: EndpointTypeRegistration
}

import {Endpoint as AWS} from './endpoints/AWS'
import {Endpoint as HTTP} from './endpoints/HTTP'
import {Endpoint as Mailgun} from './endpoints/Mailgun'
import {Endpoint as Mailjet} from './endpoints/Mailjet'
import {Endpoint as PagerDuty} from './endpoints/PagerDuty'
import {Endpoint as SendGrid} from './endpoints/SendGrid'
import {Endpoint as Slack} from './endpoints/Slack'
import {Endpoint as Telegram} from './endpoints/Telegram'
import {Endpoint as Zenoss} from './endpoints/Zenoss'

export const ENDPOINT_DEFINITIONS: TypeLookup = {
  aws: new AWS(),
  http: new HTTP(),
  mailgun: new Mailgun(),
  mailjet: new Mailjet(),
  pagerduty: new PagerDuty(),
  sendgrid: new SendGrid(),
  slack: new Slack(),
  telegram: new Telegram(),
  zenoss: new Zenoss(),
}

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

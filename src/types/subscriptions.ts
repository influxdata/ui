import {SubwayNavModel} from '@influxdata/clockface'

export enum BrokerAuthTypes {
  None = 'none',
  User = 'user',
  Certificate = 'certificate',
}

export interface Subscription {
  id?: string
  name?: string
  description?: string
  protocol?: string
  orgID?: string
  processGroupID?: string
  brokerHost?: string
  brokerPort?: number
  brokerUsername?: string
  brokerPassword?: string
  topic?: string
  dataFormat?: string
  jsonMeasurementKey?: JsonSpec
  jsonFieldKeys?: JsonSpec[]
  jsonTagKeys?: JsonSpec[]
  jsonTimestamp?: JsonSpec
  stringMeasurement: StringObjectParams
  stringFields?: StringObjectParams[]
  stringTags?: StringObjectParams[]
  stringTimestamp?: StringObjectParams
  status?: string
  bucket?: string
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
  updatedBy?: string
  tokenID?: string
  token?: string
  isActive?: string
  flowVersion?: number
  timestampPrecision?: string
  notebookID?: string
  brokerClientKey?: string
  brokerClientCert?: string
  brokerCACert?: string
  authType: BrokerAuthTypes
  brokerCertCreationDate?: string
  clientID?: string
}

export interface SubscriptionStatus {
  isActive?: boolean
  processors?: any
  processGroupID?: string
  id: string
}

export interface JsonSpec {
  path?: string
  name?: string
  type?: string
}

export interface StringObjectParams {
  pattern?: string
  name?: string
}

export enum PrecisionTypes {
  Milliseconds = 'MS',
  Seconds = 'S',
  Microseconds = 'US',
  Nanoseconds = 'NS',
}

export enum Steps {
  BrokerForm = 'broker',
  SubscriptionForm = 'subscription',
  ParsingForm = 'parsing',
}

export interface StepsStatus {
  currentStep: Steps
  clickedStep: string
  brokerStepCompleted: string
  subscriptionStepCompleted: string
  parsingStepCompleted: string
  dataFormat: string
}

export interface CompletedSteps {
  [Steps.BrokerForm]: boolean
  [Steps.SubscriptionForm]: boolean
  [Steps.ParsingForm]: boolean
}

export interface SubscriptionNavigationModel extends SubwayNavModel {
  type: string
}

export interface Subscription {
  id?: string
  name?: string
  description?: string
  protocol?: string
  orgID?: string
  processGroupId?: string
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
  qos?: number
  createdAt?: Date
  updatedAt?: Date
  tokenID?: string
  token?: string
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

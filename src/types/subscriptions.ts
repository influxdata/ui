export interface Subscription {
  id?: string
  name?: string
  protocol?: string
  orgID?: string
  processGroupId?: string
  brokerHost?: string
  brokerPort?: number
  brokerUsername?: string
  brokerPassword?: string
  topic?: string
  dataFormat?: string
  jsonMeasurementKey?: string
  jsonFieldKeys?: string
  jsonTagKeys?: string
  jsonTimestamp?: string
  stringMeasurement: string
  stringFields?: string
  stringTags?: string
  stringTimestamp?: string
  status?: string
  bucket?: string
  qos?: number
  createdAt?: string
  updatedAt?: string
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

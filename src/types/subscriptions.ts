export interface Subscription {
  orgID: string
  name: string
  protocol: string
  processGroupID: string
  brokerHost: string
  brokerPort: number
  brokerUsername?: string
  brokerPassword?: string
  brokerCert?: string
  brokerKey?: string
  topic: string
  dataFormat: string
  jsonMeasurementKey?: string
  jsonFieldKeys?: Array<string>
  jsonTagKeys?: Array<string>
  jsonTimestamp?: string
  stringMeasurement?: string
  stringFields?: Array<string>
  stringTags?: Array<string>
  stringTimestamp?: string
  status: string
  token?: string
  tokenID: string
  bucket: string
  qos: number
}

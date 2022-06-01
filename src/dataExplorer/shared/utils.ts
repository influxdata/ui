
export const LOCAL_LIMIT = 8
export const IMPORT_REGEXP = 'import "regexp"\n'
export const IMPORT_INFLUX_SCHEMA = 'import "influxdata/influxdb/schema"'

export const SAMPLE_DATA_SET = (bucketID: string) =>
  `import "influxdata/influxdb/sample"\nsample.data(set: "${bucketID}")`

export const FROM_BUCKET = (bucketName: string) =>
  `from(bucket: "${bucketName}")`

export const SEARCH_STRING = (searchTerm: string): string =>
`|> filter(fn: (r) => r._value =~ regexp.compile(v: "(?i:" + regexp.quoteMeta(v: "${searchTerm}") + ")"))`
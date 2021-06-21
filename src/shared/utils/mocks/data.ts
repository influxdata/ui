import {Variable, RemoteDataState} from 'src/types'

export const valuesVariable = {
  id: '05aeb0ad75aca000',
  orgID: '',
  status: RemoteDataState.Done,
  labels: [],
  name: 'values',
  selected: ['system'],
  arguments: {
    type: 'map',
    values: {
      system: 'system',
      usage_user: 'usage_user',
    },
  },
} as Variable

export const baseQueryVariable = {
  id: '05782ef09ddb8000',
  orgID: '',
  status: RemoteDataState.Done,
  labels: [],
  name: 'base_query',
  selected: [],
  arguments: {
    type: 'query',
    values: {
      query:
        '// base_query\nfrom(bucket: v.bucket)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r._measurement == "cpu")\n  |> filter(fn: (r) => r._field == "usage_user")',
      language: 'flux',
    },
  },
} as Variable

export const bucketVariable = {
  status: RemoteDataState.Done,
  id: '054b7476389f1000',
  orgID: '',
  labels: [],
  name: 'bucket',
  selected: ['Homeward Bound'],
  arguments: {
    type: 'query',
    values: {
      query:
        '// buckets\nbuckets()\n  |> filter(fn: (r) => r.name !~ /^_/)\n  |> rename(columns: {name: "_value"})\n  |> keep(columns: ["_value"])\n',
      language: 'flux',
      results: ['Futile Devices', 'Homeward Bound', 'woo'],
    },
  },
} as Variable

export const deploymentVariable = {
  id: '05e6e4df2287b000',
  name: 'deployment',
  selected: [],
  arguments: {
    type: 'query',
    values: {
      query:
        '// deployment\nimport "influxdata/influxdb/v1"\nv1.tagValues(bucket: v.bucket, tag: "cpu") |> keep(columns: ["_value"])',
      language: 'flux',
      results: [],
    },
  },
} as Variable

export const buildVariable = {
  id: '05e6e4fb0887b000',
  name: 'build',
  selected: [],
  arguments: {
    type: 'query',
    values: {
      query:
        '// build\nimport "influxdata/influxdb/v1"\nimport "strings"\n\nv1.tagValues(bucket: v.bucket, tag: "cpu") |> filter(fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment))',
      language: 'flux',
      results: [],
    },
  },
} as Variable

export const brokerHostVariable = {
  id: '05ba3253105a5000',
  orgID: '',
  status: RemoteDataState.Done,
  labels: [],
  name: 'broker_host',
  selected: [],
  arguments: {
    type: 'query',
    values: {
      query:
        '// broker_host\nimport "influxdata/influxdb/v1"\nv1.tagValues(bucket: v.bucket, tag: "host")',
      language: 'flux',
    },
  },
} as Variable

export const variables = [
  bucketVariable,
  {
    id: '05782ef09ddb8000',
    name: 'base_query',
    selected: [],
    arguments: {
      type: 'query',
      values: {
        query:
          '// base_query\nfrom(bucket: v.bucket)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r._measurement == "cpu")\n  |> filter(fn: (r) => r._field == "usage_user")',
        language: 'flux',
        results: [],
      },
    },
  },
  {
    id: '05aeb0ad75aca000',
    name: 'values',
    selected: ['system'],
    arguments: {
      type: 'map',
      values: {system: 'system', usage_user: 'usage_user'},
    },
  },
  brokerHostVariable,
  deploymentVariable,
  buildVariable,
] as Variable[]

export const timeMachineQuery = `from(bucket: "apps")
    |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
    |> filter(fn: (r) => r["_measurement"] == "rum")
    |> filter(fn: (r) => r["_field"] == "domInteractive")
    |> map(fn: (r) => ({r with _value: r._value / 1000.0}))
    |> group()`

import {
  parseResponse,
  parseResponseWithFromFlux,
} from 'src/shared/parsing/flux/response'
import {
  RESPONSE_NO_METADATA,
  RESPONSE_METADATA,
  MULTI_SCHEMA_RESPONSE,
  MULTI_VALUE_ROW,
  MULTI_YIELD_CSV,
  MULTI_YIELD_AND_TABLE_CSV,
  EXPECTED_COLUMNS,
  TRUNCATED_RESPONSE,
  CSV_WITH_OBJECTS,
} from 'src/shared/parsing/flux/constants'

describe('parseResponse', () => {
  test('parseResponse into the right number of tables', () => {
    const result = parseResponse(MULTI_SCHEMA_RESPONSE)
    expect(result).toHaveLength(4)
  })

  describe('result name', () => {
    test('uses the result name from the result column if present', () => {
      const resp = `#group,false,false,false,false,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,max,0,2018-12-10T18:21:52.748859Z,2018-12-10T18:30:00Z,2018-12-10T18:29:58Z,4906213376,active,mem,oox4k.local
,max,0,2018-12-10T18:30:00Z,2018-12-10T19:00:00Z,2018-12-10T18:54:08Z,5860683776,active,mem,oox4k.local
,max,0,2018-12-10T19:00:00Z,2018-12-10T19:21:52.748859Z,2018-12-10T19:11:58Z,5115428864,active,mem,oox4k.local

`

      const actual = parseResponse(resp)

      expect(actual[0].result).toBe('max')
    })

    test('uses the result name from the default annotation if result columns are empty', () => {
      const resp = `#group,false,false,false,false,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,max,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,,0,2018-12-10T18:21:52.748859Z,2018-12-10T18:30:00Z,2018-12-10T18:29:58Z,4906213376,active,mem,oox4k.local
,,0,2018-12-10T18:30:00Z,2018-12-10T19:00:00Z,2018-12-10T18:54:08Z,5860683776,active,mem,oox4k.local
,,0,2018-12-10T19:00:00Z,2018-12-10T19:21:52.748859Z,2018-12-10T19:11:58Z,5115428864,active,mem,oox4k.local

#group,false,false,false,false,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,min,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,,0,2018-12-10T18:21:52.748859Z,2018-12-10T18:30:00Z,2018-12-10T18:29:48Z,4589981696,active,mem,oox4k.local
,,0,2018-12-10T18:30:00Z,2018-12-10T19:00:00Z,2018-12-10T18:40:18Z,4318040064,active,mem,oox4k.local
,,0,2018-12-10T19:00:00Z,2018-12-10T19:21:52.748859Z,2018-12-10T19:13:58Z,4131692544,active,mem,oox4k.local


`
      const actual = parseResponse(resp)

      expect(actual).toHaveLength(2)
      expect(actual[0].result).toBe('max')
      expect(actual[1].result).toBe('min')
    })
  })

  describe('headers', () => {
    test('throws when no metadata is present', () => {
      expect(() => {
        parseResponse(RESPONSE_NO_METADATA)
      }).toThrow()
    })

    test('can parse headers when metadata is present', () => {
      const actual = parseResponse(RESPONSE_METADATA)[0].data[0]
      expect(actual).toEqual(EXPECTED_COLUMNS)
    })
  })

  describe('group key', () => {
    test('parses the group key properly', () => {
      const actual = parseResponse(MULTI_SCHEMA_RESPONSE)[0].groupKey
      const expected = {
        _field: 'usage_guest',
        _measurement: 'cpu',
        cpu: 'cpu-total',
        host: 'WattsInfluxDB',
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('partial responses', () => {
    test('should discard tables without any non-annotation rows', () => {
      const actual = parseResponse(TRUNCATED_RESPONSE)

      expect(actual).toHaveLength(2)
    })
  })
})

describe('parseResponseWithFromFlux', () => {
  test('parseResponseWithFromFlux splits chunks based on tables and yields', () => {
    const result = parseResponseWithFromFlux(MULTI_SCHEMA_RESPONSE)
    expect(result).toHaveLength(4)
  })
  test('should not convert NaN timestamps', () => {
    const CSV = `
#group,false,false,false,false,false,false,false,false
#datatype,string,long,string,string,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double
#default,_result,,,,,,,,,,,,,,
,result,table,_field_key2,_measurement_key2,_start_key2,_stop_key2,_time,_value_key2
,,0,gauge,kube_pod_container_resource_requests_cpu_cores,2020-10-16T15:41:21.798083141Z,2020-10-16T16:41:21.798083141Z,2020-10-16T15:41:57Z,0.1
,,0,gauge,kube_pod_container_resource_requests_cpu_cores,2020-10-16T15:41:21.798083141Z,2020-10-16T16:41:21.798083141Z,,0.1
`.trim()

    const expected = [
      [
        '',
        'result',
        'table',
        '_field_key2',
        '_measurement_key2',
        '_start_key2',
        '_stop_key2',
        '_time',
        '_value_key2',
      ],
      [
        '',
        '',
        '0',
        'gauge',
        'kube_pod_container_resource_requests_cpu_cores',
        '2020-10-16T15:41:21.798Z',
        '2020-10-16T16:41:21.798Z',
        '2020-10-16T15:41:57.000Z',
        '0.1',
      ],
      [
        '',
        '',
        '0',
        'gauge',
        'kube_pod_container_resource_requests_cpu_cores',
        '2020-10-16T15:41:21.798Z',
        '2020-10-16T16:41:21.798Z',
        'NaN',
        '0.1',
      ],
    ]

    const result = parseResponseWithFromFlux(CSV)
    expect(result[0].data).toEqual(expected)
  })
  test('parseResponseWithFromFlux can properly handle nested error objects in CSVs', () => {
    const result = parseResponseWithFromFlux(CSV_WITH_OBJECTS)
    const expected = [
      {
        id: '7e1d5a35-fe4a-4963-8be5-0a4281039d5d',
        name: 'result=_result',
        data: [
          [
            '',
            'result',
            'table',
            '_field',
            '_start',
            '_stop',
            '_time',
            '_value',
            'env',
            'error',
            'errorCode',
            'errorType',
            'host',
            'hostname',
            'nodename',
            'orgID',
            'request',
            'source',
          ],
          [
            '',
            '',
            '0',
            'request',
            '2020-09-02T12:00:00.000Z',
            '2020-09-02T13:00:00.000Z',
            '2020-09-02T12:51:01.660Z',
            '{"request":{"organization_id":"a2ec9780bc3b0e58","compiler":{"Now":"2020-09-02T12:51:01.65041241Z","query":"from(bucket: "ExtranetDumpCustomerTag")\n' +
              '  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n' +
              '  |> filter(fn: (r) => r["_measurement"] == "EnergyValue")\n' +
              '  |> filter(fn: (r) => r["_field"] == "current1")\n' +
              `  |> filter(fn: (r) => r["customer"] == '')\n` +
              '  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)\n' +
              '  |> yield(name: "mean")"},"source":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
            'prod01-eu-central-1',
            "compilation failed: error at @5:13-5:42: invalid expression @5:41-5:42: '",
            'invalid',
            'user',
            'queryd-v1-d6b75bfbc-5mpmf',
            'queryd-v1-d6b75bfbc-5mpmf',
            'ip-10-153-10-96.eu-central-1.compute.internal',
            'a2ec9780bc3b0e58',
            `from(bucket: "ExtranetDumpCustomerTag")  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)  |> filter(fn: (r) => r["_measurement"] == "EnergyValue")  |> filter(fn: (r) => r["_field"] == "current1")  |> filter(fn: (r) => r["customer"] == '')  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)  |> yield(name: "mean")`,
            'Chrome',
          ],
          [
            '',
            '',
            '0',
            'request',
            '2020-09-02T12:00:00.000Z',
            '2020-09-02T13:00:00.000Z',
            '2020-09-02T12:20:49.452Z',
            '{"request":{"organization_id":"a2ec9780bc3b0e58","compiler":{"Now":"2020-09-02T12:20:49.439287155Z","query":"from(bucket: "ExtranetDumpCustomerTag")\n' +
              '|>range(start: "2015-02-09 11:38:00.000", stop: "2015-02-09 11:40:00.000")\n' +
              '|>filter(fn: (r) => r["_measurement"] =="EnergyValue")\n' +
              '|>yield()\n' +
              '\n' +
              '"},"source":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
            'prod01-eu-central-1',
            'error calling function "yield": error calling function "filter": error calling function "range": value is not a time, got string',
            'invalid',
            'user',
            'queryd-v1-d6b75bfbc-2zlj8',
            'queryd-v1-d6b75bfbc-2zlj8',
            'ip-10-153-10-96.eu-central-1.compute.internal',
            'a2ec9780bc3b0e58',
            'from(bucket: "ExtranetDumpCustomerTag")|>range(start: "2015-02-09 11:38:00.000", stop: "2015-02-09 11:40:00.000")|>filter(fn: (r) => r["_measurement"] =="EnergyValue")|>yield()',
            'Chrome',
          ],
          [
            '',
            '',
            '0',
            'request',
            '2020-09-02T12:00:00.000Z',
            '2020-09-02T13:00:00.000Z',
            '2020-09-02T12:01:25.234Z',
            '{"request":{"organization_id":"bae87e9ccb059b86","compiler":{"Now":"2020-09-02T12:01:25.175728724Z","query":"from(bucket: "observations")\r\n' +
              '  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\r\n' +
              '  |> filter(fn: (r) => r["_measurement"] == "lkx" or r["_measurement"] == "weather")\r\n' +
              '  |> filter(fn: (r) => r["Alias"] == "LKX201-2")\r\n' +
              '  |> filter(fn: (r) => r["_field"] == "WindDirection")\r\n' +
              '  |> filter(fn: (r) => r["_value"] <= 359)\r\n' +
              '  |> aggregateWindow(every: v.windowPeriod, fn: median, createEmpty: false)\r\n' +
              '  |> yield(name: "median")"},"source":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
            'prod01-eu-central-1',
            'unsupported aggregate column type int; unsupported aggregate column type int',
            'invalid',
            'user',
            'queryd-v1-d6b75bfbc-z5cmc',
            'queryd-v1-d6b75bfbc-z5cmc',
            'ip-10-153-10-33.eu-central-1.compute.internal',
            'bae87e9ccb059b86',
            'rom(bucket: "observations")\r  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\r  |> filter(fn: (r) => r["_measurement"] == "lkx" or r["_measurement"] == "weather")\r  |> filter(fn: (r) => r["Alias"] == "LKX201-2")\r  |> filter(fn: (r) => r["_field"] == "WindDirection")\r  |> filter(fn: (r) => r["_value"] <= 359)\r  |> aggregateWindow(every: v.windowPeriod, fn: median, createEmpty: false)\r  |> yield(name: "median")',
            'Chrome',
          ],
          [
            '',
            '',
            '0',
            'request',
            '2020-09-02T12:00:00.000Z',
            '2020-09-02T13:00:00.000Z',
            '2020-09-02T12:05:02.640Z',
            '{"request":{"organization_id":"a2ec9780bc3b0e58","compiler":{"Now":"2020-09-02T12:05:02.620536688Z","query":"from(bucket: "ExtranetDumpCustomerTag")\n' +
              '  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n' +
              '  |> filter(fn: (r) => r["_measurement"] == "WeatherValue")\n' +
              '  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n' +
              '  |> yield(name: "mean")"},"source":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
            'prod01-eu-central-1',
            'unsupported input type for mean aggregate: boolean; unsupported input type for mean aggregate: boolean',
            'invalid',
            'user',
            'queryd-v1-d6b75bfbc-kznb5',
            'queryd-v1-d6b75bfbc-kznb5',
            'ip-10-153-10-149.eu-central-1.compute.internal',
            'a2ec9780bc3b0e58',
            'from(bucket: "ExtranetDumpCustomerTag")  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)  |> filter(fn: (r) => r["_measurement"] == "WeatherValue")  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)  |> yield(name: "mean")',
            'Chrome',
          ],
          [
            '',
            '',
            '0',
            'request',
            '2020-09-02T12:00:00.000Z',
            '2020-09-02T13:00:00.000Z',
            '2020-09-02T12:03:30.694Z',
            '{"request":{"organization_id":"dc56bb3c07ec663c","compiler":{"Now":"2020-09-02T12:03:30.679008917Z","query":"SELECT * from MyDB"},"source":"Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
            'prod01-eu-west-1',
            'error @1:1-1:7: undefined identifier SELECT',
            'invalid',
            'user',
            'queryd-v1-668bbdcf74-5m4n2',
            'queryd-v1-668bbdcf74-5m4n2',
            'aks-storage-23576596-vmss00000u',
            'dc56bb3c07ec663c',
            'SELECT * from MyDB',
            'Firefox',
          ],
          [
            '',
            '',
            '0',
            'request',
            '2020-09-02T12:00:00.000Z',
            '2020-09-02T13:00:00.000Z',
            '2020-09-02T12:15:16.019Z',
            '{"request":{"organization_id":"dc56bb3c07ec663c","compiler":{"Now":"2020-09-02T12:15:16.002284529Z","query":"data = from(bucket: "db/MyDB")\r\n' +
              '  \r\n' +
              '"},"source":"Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
            'prod01-eu-west-1',
            'error in query specification while starting program: this Flux script returns no streaming data. Consider adding a "yield" or invoking streaming functions directly, without performing an assignment',
            'invalid',
            'user',
            'queryd-v1-668bbdcf74-87t2j',
            'queryd-v1-668bbdcf74-87t2j',
            'aks-storage-23576596-vmss00000w',
            'dc56bb3c07ec663c',
            'data = from(bucket: "db/MyDB")\r  \r',
            'Firefox',
          ],
          [
            '',
            '',
            '0',
            'request',
            '2020-09-02T12:00:00.000Z',
            '2020-09-02T13:00:00.000Z',
            '2020-09-02T12:29:49.066Z',
            '{"request":{"organization_id":"c86c6a73dbfd08b8","compiler":{"Now":"2020-09-02T12:29:49.041696404Z","query":"from(bucket: "cronjobs")\n' +
              '  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n' +
              '  |> filter(fn: (r) => r["_measurement"] == "iconico-cronjobs-5ed512ac09c51c0bea12ec55")\n' +
              '  |> filter(fn: (r) => r["_field"] == "msg")\n' +
              '  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n' +
              '  |> yield(name: "mean")"},"source":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
            'prod01-us-central-1',
            'unsupported input type for mean aggregate: string; unsupported input type for mean aggregate: string',
            'invalid',
            'user',
            'queryd-v1-dc8994845-67z87',
            'queryd-v1-dc8994845-67z87',
            'gke-prod01-us-central-1-highmem1-4bc74378-dbm8',
            'c86c6a73dbfd08b8',
            'from(bucket: "cronjobs")  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)  |> filter(fn: (r) => r["_measurement"] == "iconico-cronjobs-5ed512ac09c51c0bea12ec55")  |> filter(fn: (r) => r["_field"] == "msg")  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)  |> yield(name: "mean")',
            'Chrome',
          ],
        ],
        result: '_result',
        groupKey: {result: '_result'},
        dataTypes: {
          '': '#datatype',
          result: 'string',
          table: 'long',
          _field: 'string',
          _start: 'dateTime:RFC3339',
          _stop: 'dateTime:RFC3339',
          _time: 'dateTime:RFC3339',
          _value: 'string',
          env: 'string',
          error: 'string',
          errorCode: 'string',
          errorType: 'string',
          host: 'string',
          hostname: 'string',
          nodename: 'string',
          orgID: 'string',
          request: 'string',
          source: 'string',
          _measurement: 'string',
          TotalDuration: 'long',
          CompileDuration: 'long',
          QueueDuration: 'long',
          PlanDuration: 'long',
          RequeueDuration: 'long',
          ExecuteDuration: 'long',
          Concurrency: 'long',
          MaxAllocated: 'long',
          TotalAllocated: 'long',
          RuntimeErrors: 'string',
          'flux/query-plan': 'string',
          'influxdb/scanned-bytes': 'long',
          'influxdb/scanned-values': 'long',
        },
      },
      {
        id: '4041c3e5-361e-46bc-94ca-630cb32339b1',
        name: 'result=_profiler _measurement=profiler/query',
        data: [
          [
            '',
            'result',
            'table',
            '_measurement',
            'TotalDuration',
            'CompileDuration',
            'QueueDuration',
            'PlanDuration',
            'RequeueDuration',
            'ExecuteDuration',
            'Concurrency',
            'MaxAllocated',
            'TotalAllocated',
            'RuntimeErrors',
            'flux/query-plan',
            'influxdb/scanned-bytes',
            'influxdb/scanned-values',
          ],
          [
            '',
            '',
            '0',
            'profiler/query',
            '41826554659',
            '2390321',
            '41026',
            '0',
            '0',
            '41824071714',
            '0',
            '326272',
            '0',
            '',
            'digraph {\n' +
              '  merged_ReadRange_filter2\n' +
              '  map3\n' +
              '  map4\n' +
              '  map5\n' +
              '  map6\n' +
              '  map7\n' +
              '  filter8\n' +
              '  // r.request !~ <semantic format error, unknown node *semantic.RegexpLiteral>\n' +
              '  drop9\n' +
              '  // DualImplProcedureSpec, UseDeprecated = false\n' +
              '  group10\n' +
              '  yield11\n' +
              '\n' +
              '  merged_ReadRange_filter2 -> map3\n' +
              '  map3 -> map4\n' +
              '  map4 -> map5\n' +
              '  map5 -> map6\n' +
              '  map6 -> map7\n' +
              '  map7 -> filter8\n' +
              '  filter8 -> drop9\n' +
              '  drop9 -> group10\n' +
              '  group10 -> yield11\n' +
              '}\n',
            '156253',
            '27',
          ],
        ],
        result: '_profiler',
        groupKey: {result: '_profiler', _measurement: 'profiler/query'},
        dataTypes: {
          '': '#datatype',
          result: 'string',
          table: 'long',
          _field: 'string',
          _start: 'dateTime:RFC3339',
          _stop: 'dateTime:RFC3339',
          _time: 'dateTime:RFC3339',
          _value: 'string',
          env: 'string',
          error: 'string',
          errorCode: 'string',
          errorType: 'string',
          host: 'string',
          hostname: 'string',
          nodename: 'string',
          orgID: 'string',
          request: 'string',
          source: 'string',
          _measurement: 'string',
          TotalDuration: 'long',
          CompileDuration: 'long',
          QueueDuration: 'long',
          PlanDuration: 'long',
          RequeueDuration: 'long',
          ExecuteDuration: 'long',
          Concurrency: 'long',
          MaxAllocated: 'long',
          TotalAllocated: 'long',
          RuntimeErrors: 'string',
          'flux/query-plan': 'string',
          'influxdb/scanned-bytes': 'long',
          'influxdb/scanned-values': 'long',
        },
      },
    ]
    expect(result[0].data).toEqual(expected[0].data)
    expect(result[1].data).toEqual(expected[1].data)
  })
  test('parseResponseWithFromFlux splits chunks based on tables', () => {
    const result = parseResponseWithFromFlux(MULTI_VALUE_ROW)
    expect(result).toHaveLength(2)
  })
  test('parseResponseWithFromFlux splits chunks based on yields', () => {
    const result = parseResponseWithFromFlux(MULTI_YIELD_CSV)
    expect(result).toHaveLength(3)
  })
  test('parseResponseWithFromFlux splits chunks based on yields and tables', () => {
    const result = parseResponseWithFromFlux(MULTI_YIELD_AND_TABLE_CSV)
    expect(result).toHaveLength(4)
  })

  describe('result name', () => {
    test('uses the result name from the result column if present', () => {
      const resp = `#group,false,false,false,false,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,max,0,2018-12-10T18:21:52.748859Z,2018-12-10T18:30:00Z,2018-12-10T18:29:58Z,4906213376,active,mem,oox4k.local
,max,0,2018-12-10T18:30:00Z,2018-12-10T19:00:00Z,2018-12-10T18:54:08Z,5860683776,active,mem,oox4k.local
,max,0,2018-12-10T19:00:00Z,2018-12-10T19:21:52.748859Z,2018-12-10T19:11:58Z,5115428864,active,mem,oox4k.local

`

      const actual = parseResponseWithFromFlux(resp)

      expect(actual[0].result).toBe('max')
    })

    test('uses the result name from the default annotation if result columns are empty', () => {
      const resp = `#group,false,false,false,false,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,max,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,,0,2018-12-10T18:21:52.748859Z,2018-12-10T18:30:00Z,2018-12-10T18:29:58Z,4906213376,active,mem,oox4k.local
,,0,2018-12-10T18:30:00Z,2018-12-10T19:00:00Z,2018-12-10T18:54:08Z,5860683776,active,mem,oox4k.local
,,0,2018-12-10T19:00:00Z,2018-12-10T19:21:52.748859Z,2018-12-10T19:11:58Z,5115428864,active,mem,oox4k.local

#group,false,false,false,false,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,min,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,,0,2018-12-10T18:21:52.748859Z,2018-12-10T18:30:00Z,2018-12-10T18:29:48Z,4589981696,active,mem,oox4k.local
,,0,2018-12-10T18:30:00Z,2018-12-10T19:00:00Z,2018-12-10T18:40:18Z,4318040064,active,mem,oox4k.local
,,0,2018-12-10T19:00:00Z,2018-12-10T19:21:52.748859Z,2018-12-10T19:13:58Z,4131692544,active,mem,oox4k.local


`
      const actual = parseResponseWithFromFlux(resp)

      expect(actual).toHaveLength(2)
      expect(actual[0].result).toBe('max')
      expect(actual[1].result).toBe('min')
    })
  })

  describe('headers', () => {
    test('does not throw when no metadata is present', () => {
      expect(() => {
        parseResponseWithFromFlux(RESPONSE_NO_METADATA)
      }).not.toThrow()
      const actual = parseResponseWithFromFlux(RESPONSE_NO_METADATA)
      expect(actual).toEqual([])
    })

    test('can parse headers when metadata is present', () => {
      const actual = parseResponseWithFromFlux(RESPONSE_METADATA)[0].data[0]
      expect(actual).toEqual(EXPECTED_COLUMNS)
    })
  })

  describe('group key', () => {
    test('parses the group key properly', () => {
      const actual = parseResponseWithFromFlux(MULTI_SCHEMA_RESPONSE)[0]
        .groupKey
      const expected = {
        _field: 'usage_guest',
        _measurement: 'cpu',
        cpu: 'cpu-total',
        host: 'WattsInfluxDB',
        result: '_result',
      }
      expect(actual).toEqual(expected)
    })
    test('should output the groupKey with the yield / result', () => {
      const actual = parseResponseWithFromFlux(MULTI_YIELD_CSV)[0].groupKey
      const expected = {
        result: 'mean',
      }
      expect(actual).toEqual(expected)
    })
  })

  describe('partial responses', () => {
    test('should discard tables without any non-annotation rows', () => {
      const actual = parseResponseWithFromFlux(TRUNCATED_RESPONSE)
      expect(actual).toHaveLength(0)
    })
  })
})

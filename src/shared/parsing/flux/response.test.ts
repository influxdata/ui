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
            '{"request":{"authorization":{"id":"063fb56f630e2000","token":"","status":"active","description":"","orgID":"a2ec9780bc3b0e58","userID":"061a208c88f50000","permissions":[{"action":"read","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"users","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","id":"061a208c88f50000"}},{"action":"write","resource":{"type":"users","id":"061a208c88f50000"}},{"action":"read","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","id":"061a208c88f50000"}},{"action":"write","resource":{"type":"users","id":"061a208c88f50000"}}],"createdAt":"0001-01-01T00:00:00Z","updatedAt":"0001-01-01T00:00:00Z"},"organization_id":"a2ec9780bc3b0e58","compiler":{"Now":"2020-09-02T12:51:01.65041241Z","extern":{"type":"File","package":null,"imports":null,"body":[{"type":"OptionStatement","assignment":{"type":"VariableAssignment","id":{"type":"Identifier","name":"v"},"init":{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"timeRangeStart"},"value":{"type":"DateTimeLiteral","value":"2014-12-31T23:00:00.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStop"},"value":{"type":"DateTimeLiteral","value":"2015-12-31T23:00:00.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"windowPeriod"},"value":{"type":"DurationLiteral","values":[{"magnitude":87600000,"unit":"ms"}]}}]}}}]},"query":"from(bucket: "ExtranetDumpCustomerTag")\n' +
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
            '{"request":{"authorization":{"id":"063fa8ce348c7000","token":"","status":"active","description":"","orgID":"a2ec9780bc3b0e58","userID":"06199a135239f000","permissions":[{"action":"read","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"users","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","id":"06199a135239f000"}},{"action":"write","resource":{"type":"users","id":"06199a135239f000"}},{"action":"read","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","id":"06199a135239f000"}},{"action":"write","resource":{"type":"users","id":"06199a135239f000"}}],"createdAt":"0001-01-01T00:00:00Z","updatedAt":"0001-01-01T00:00:00Z"},"organization_id":"a2ec9780bc3b0e58","compiler":{"Now":"2020-09-02T12:20:49.439287155Z","extern":{"type":"File","package":null,"imports":null,"body":[{"type":"OptionStatement","assignment":{"type":"VariableAssignment","id":{"type":"Identifier","name":"v"},"init":{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"timeRangeStart"},"value":{"type":"DateTimeLiteral","value":"2015-02-09T10:38:00.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStop"},"value":{"type":"DateTimeLiteral","value":"2015-02-09T10:40:00.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"windowPeriod"},"value":{"type":"DurationLiteral","values":[{"magnitude":333,"unit":"ms"}]}}]}}}]},"query":"from(bucket: "ExtranetDumpCustomerTag")\n' +
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
            '{"request":{"authorization":{"id":"063faadc65bf7000","token":"","status":"active","description":"","orgID":"bae87e9ccb059b86","userID":"06155b1cdae7c000","permissions":[{"action":"read","resource":{"type":"authorizations","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"authorizations","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"buckets","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"buckets","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"dashboards","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"dashboards","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"orgs","id":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"orgs","id":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"sources","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"sources","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"tasks","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"tasks","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"telegrafs","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"telegrafs","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"users","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"users","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"variables","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"variables","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"scrapers","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"scrapers","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"secrets","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"secrets","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"labels","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"labels","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"views","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"views","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"documents","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"documents","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"notificationRules","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"notificationRules","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"checks","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"checks","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"dbrp","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"dbrp","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"buckets","orgID":"bae87e9ccb059b86"}},{"action":"write","resource":{"type":"buckets","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"buckets","id":"e8055ded433caff2","orgID":"bae87e9ccb059b86"}},{"action":"read","resource":{"type":"users","id":"06155b1cdae7c000"}},{"action":"write","resource":{"type":"users","id":"06155b1cdae7c000"}}],"createdAt":"0001-01-01T00:00:00Z","updatedAt":"0001-01-01T00:00:00Z"},"organization_id":"bae87e9ccb059b86","compiler":{"Now":"2020-09-02T12:01:25.175728724Z","extern":{"type":"File","package":null,"imports":null,"body":[{"type":"OptionStatement","assignment":{"type":"VariableAssignment","id":{"type":"Identifier","name":"v"},"init":{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"Tæki"},"value":{"type":"StringLiteral","value":"8"}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStart"},"value":{"type":"DateTimeLiteral","value":"2020-08-25T10:58:54.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStop"},"value":{"type":"DateTimeLiteral","value":"2020-08-26T11:58:54.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"windowPeriod"},"value":{"type":"DurationLiteral","values":[{"magnitude":250000,"unit":"ms"}]}}]}}}]},"query":"from(bucket: "observations")\r\n' +
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
            '{"request":{"authorization":{"id":"063fa524b3194000","token":"","status":"active","description":"","orgID":"a2ec9780bc3b0e58","userID":"061a208c88f50000","permissions":[{"action":"read","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"users","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"authorizations","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"buckets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"checks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dashboards","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"dbrp","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"documents","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"labels","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationRules","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"orgs","id":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"secrets","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"scrapers","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"sources","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"tasks","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"telegrafs","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","id":"061a208c88f50000"}},{"action":"write","resource":{"type":"users","id":"061a208c88f50000"}},{"action":"read","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"variables","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"write","resource":{"type":"views","orgID":"a2ec9780bc3b0e58"}},{"action":"read","resource":{"type":"users","id":"061a208c88f50000"}},{"action":"write","resource":{"type":"users","id":"061a208c88f50000"}}],"createdAt":"0001-01-01T00:00:00Z","updatedAt":"0001-01-01T00:00:00Z"},"organization_id":"a2ec9780bc3b0e58","compiler":{"Now":"2020-09-02T12:05:02.620536688Z","extern":{"type":"File","package":null,"imports":null,"body":[{"type":"OptionStatement","assignment":{"type":"VariableAssignment","id":{"type":"Identifier","name":"v"},"init":{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"timeRangeStart"},"value":{"type":"DateTimeLiteral","value":"2015-02-09T10:38:00.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStop"},"value":{"type":"DateTimeLiteral","value":"2015-02-09T10:40:00.000Z"}},{"type":"Property","key":{"type":"Identifier","name":"windowPeriod"},"value":{"type":"DurationLiteral","values":[{"magnitude":333,"unit":"ms"}]}}]}}}]},"query":"from(bucket: "ExtranetDumpCustomerTag")\n' +
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
            '{"request":{"authorization":{"id":"063f9b5ac6045000","token":"","status":"active","description":"","orgID":"dc56bb3c07ec663c","userID":"063f9b4954d66000","permissions":[{"action":"read","resource":{"type":"authorizations","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"authorizations","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"buckets","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"buckets","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"dashboards","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"dashboards","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"orgs","id":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"orgs","id":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"sources","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"sources","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"tasks","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"tasks","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"telegrafs","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"telegrafs","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"users","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"users","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"variables","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"variables","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"scrapers","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"scrapers","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"secrets","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"secrets","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"labels","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"labels","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"views","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"views","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"documents","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"documents","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"notificationRules","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"notificationRules","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"checks","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"checks","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"dbrp","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"dbrp","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"buckets","id":"2d96370493e32279","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"telegrafs","id":"063f9d793b166000","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"users","id":"063f9b4954d66000"}},{"action":"write","resource":{"type":"users","id":"063f9b4954d66000"}}],"createdAt":"0001-01-01T00:00:00Z","updatedAt":"0001-01-01T00:00:00Z"},"organization_id":"dc56bb3c07ec663c","compiler":{"Now":"2020-09-02T12:03:30.679008917Z","extern":{"type":"File","package":null,"imports":null,"body":[{"type":"OptionStatement","assignment":{"type":"VariableAssignment","id":{"type":"Identifier","name":"v"},"init":{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"bucket"},"value":{"type":"StringLiteral","value":""}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStart"},"value":{"type":"UnaryExpression","operator":"-","argument":{"type":"DurationLiteral","values":[{"magnitude":5,"unit":"m"}]}}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStop"},"value":{"type":"CallExpression","callee":{"type":"Identifier","name":"now"}}}]}}}]},"query":"SELECT * from MyDB"},"source":"Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0","compiler_type":"flux"},"dialect":{"header":true,"delimiter":",","annotations":["group","datatype","default"]},"dialect_type":"csv"}',
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
            '{"request":{"authorization":{"id":"063f9b5ac6045000","token":"","status":"active","description":"","orgID":"dc56bb3c07ec663c","userID":"063f9b4954d66000","permissions":[{"action":"read","resource":{"type":"authorizations","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"authorizations","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"buckets","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"buckets","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"dashboards","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"dashboards","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"orgs","id":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"orgs","id":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"sources","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"sources","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"tasks","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"tasks","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"telegrafs","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"telegrafs","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"users","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"users","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"variables","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"variables","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"scrapers","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"scrapers","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"secrets","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"secrets","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"labels","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"labels","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"views","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"views","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"documents","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"documents","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"notificationRules","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"notificationRules","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"checks","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"checks","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"dbrp","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"dbrp","orgID":"dc56bb3c07ec663c"}},{"action":"write","resource":{"type":"buckets","id":"2d96370493e32279","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"telegrafs","id":"063f9d793b166000","orgID":"dc56bb3c07ec663c"}},{"action":"read","resource":{"type":"users","id":"063f9b4954d66000"}},{"action":"write","resource":{"type":"users","id":"063f9b4954d66000"}}],"createdAt":"0001-01-01T00:00:00Z","updatedAt":"0001-01-01T00:00:00Z"},"organization_id":"dc56bb3c07ec663c","compiler":{"Now":"2020-09-02T12:15:16.002284529Z","extern":{"type":"File","package":null,"imports":null,"body":[{"type":"OptionStatement","assignment":{"type":"VariableAssignment","id":{"type":"Identifier","name":"v"},"init":{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"bucket"},"value":{"type":"StringLiteral","value":""}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStart"},"value":{"type":"UnaryExpression","operator":"-","argument":{"type":"DurationLiteral","values":[{"magnitude":1,"unit":"h"}]}}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStop"},"value":{"type":"CallExpression","callee":{"type":"Identifier","name":"now"}}}]}}}]},"query":"data = from(bucket: "db/MyDB")\r\n' +
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
            '{"request":{"authorization":{"id":"063fb21b8c0f5000","token":"","status":"active","description":"","orgID":"c86c6a73dbfd08b8","userID":"05275d2dffbc2000","permissions":[{"action":"read","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"orgs","id":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"orgs","id":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"notificationRules","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"notificationRules","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"checks","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"checks","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"dbrp","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"dbrp","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"buckets","id":"b1216af140aadc17"}},{"action":"read","resource":{"type":"buckets","id":"b1216af140aadc17"}},{"action":"read","resource":{"type":"orgs","id":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"checks","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"checks","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"notificationRules","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"notificationRules","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"orgs","id":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"authorizations","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"buckets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"checks","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"checks","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"dashboards","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"documents","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"labels","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"notificationRules","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"notificationRules","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"notificationEndpoints","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"notificationEndpoints","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"orgs","id":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"secrets","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"scrapers","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"sources","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"tasks","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"telegrafs","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"users","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"variables","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"write","resource":{"type":"views","orgID":"c86c6a73dbfd08b8"}},{"action":"read","resource":{"type":"users","id":"05275d2dffbc2000"}},{"action":"write","resource":{"type":"users","id":"05275d2dffbc2000"}}],"createdAt":"0001-01-01T00:00:00Z","updatedAt":"0001-01-01T00:00:00Z"},"organization_id":"c86c6a73dbfd08b8","compiler":{"Now":"2020-09-02T12:29:49.041696404Z","extern":{"type":"File","package":null,"imports":null,"body":[{"type":"OptionStatement","assignment":{"type":"VariableAssignment","id":{"type":"Identifier","name":"v"},"init":{"type":"ObjectExpression","properties":[{"type":"Property","key":{"type":"Identifier","name":"timeRangeStart"},"value":{"type":"UnaryExpression","operator":"-","argument":{"type":"DurationLiteral","values":[{"magnitude":15,"unit":"m"}]}}},{"type":"Property","key":{"type":"Identifier","name":"timeRangeStop"},"value":{"type":"CallExpression","callee":{"type":"Identifier","name":"now"}}},{"type":"Property","key":{"type":"Identifier","name":"windowPeriod"},"value":{"type":"DurationLiteral","values":[{"magnitude":10000,"unit":"ms"}]}}]}}}]},"query":"from(bucket: "cronjobs")\n' +
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
    test('throws when no metadata is present', () => {
      expect(() => {
        parseResponseWithFromFlux(RESPONSE_NO_METADATA)
      }).toThrow()
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

      expect(actual).toHaveLength(2)
    })
  })
})

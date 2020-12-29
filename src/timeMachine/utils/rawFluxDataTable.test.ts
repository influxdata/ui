import {parseFiles, parseFilesWithFromFlux} from './rawFluxDataTable'
import {CSV_WITH_OBJECTS} from 'src/shared/parsing/flux/constants'

describe('parseFiles', () => {
  test('can parse multi-csv response', () => {
    const CSV = `
#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,0,howdy,5
,,0,hello there,5
,,0,hi,6

#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,1,howdy,5
,,1,hello there,5
,,1,hi,6
`.trim()

    const expectedData = [
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result', '', '', ''],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '0', 'howdy', '5'],
      ['', '', '0', 'hello there', '5'],
      ['', '', '0', 'hi', '6'],
      [],
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result', '', '', ''],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '1', 'howdy', '5'],
      ['', '', '1', 'hello there', '5'],
      ['', '', '1', 'hi', '6'],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 5,
    }

    expect(parseFiles([CSV])).toEqual(expected)
  })

  test('can parse multi-csv response with values containing newlines', () => {
    const CSV = `
#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,0,howdy,5
,,0,"hello

there",5
,,0,hi,6

#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,1,howdy,5
,,1,"hello

there",5
,,1,hi,6
`.trim()

    const expectedData = [
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result', '', '', ''],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '0', 'howdy', '5'],
      ['', '', '0', 'hello\n\nthere', '5'],
      ['', '', '0', 'hi', '6'],
      [],
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result', '', '', ''],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '1', 'howdy', '5'],
      ['', '', '1', 'hello\n\nthere', '5'],
      ['', '', '1', 'hi', '6'],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 5,
    }

    expect(parseFiles([CSV])).toEqual(expected)
  })
})

describe('parseFilesWithFromFlux', () => {
  test('can parse multi-csv response', () => {
    const CSV = `
#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,0,howdy,5
,,0,hello there,5
,,0,hi,6

#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,1,howdy,5
,,1,hello there,5
,,1,hi,6
`.trim()

    const expectedData = [
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '0', 'howdy', '5'],
      ['', '', '0', 'hello there', '5'],
      ['', '', '0', 'hi', '6'],
      [],
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '1', 'howdy', '5'],
      ['', '', '1', 'hello there', '5'],
      ['', '', '1', 'hi', '6'],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 5,
    }

    const result = parseFilesWithFromFlux([CSV])
    expect(result).toEqual(expected)
  })
  test('splits the csv chunks based on tables', () => {
    const CSV = `
#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,0,howdy,5
,,0,hello there,5
,,0,hi,6

#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,1,howdy,5
,,1,hello there,5
,,1,hi,6
`.trim()

    const expectedData = [
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '0', 'howdy', '5'],
      ['', '', '0', 'hello there', '5'],
      ['', '', '0', 'hi', '6'],
      [],
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '1', 'howdy', '5'],
      ['', '', '1', 'hello there', '5'],
      ['', '', '1', 'hi', '6'],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 5,
    }

    const result = parseFilesWithFromFlux([CSV])
    expect(result).toEqual(expected)
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

    const expectedData = [
      [
        '#group',
        'false',
        'false',
        'false',
        'false',
        'false',
        'false',
        'false',
        'false',
      ],
      [
        '#datatype',
        'string',
        'long',
        'string',
        'string',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'double',
      ],
      ['#default', '_result'],
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

    const expected = {
      data: expectedData,
      maxColumnCount: 9,
    }

    const result = parseFilesWithFromFlux([CSV])
    expect(result).toEqual(expected)
  })
  test('splits the csv chunks based on results', () => {
    const CSV = `
#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,0,howdy,5
,,0,hello there,5
,,0,hi,6

#group,false,false,false,false
#datatype,string,long,string,long
#default,foo,,,
,result,table,message,value
,,0,howdy,5
,,0,hello there,5
,,0,hi,6
`.trim()

    const expectedData = [
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '0', 'howdy', '5'],
      ['', '', '0', 'hello there', '5'],
      ['', '', '0', 'hi', '6'],
      [],
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', 'foo'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '0', 'howdy', '5'],
      ['', '', '0', 'hello there', '5'],
      ['', '', '0', 'hi', '6'],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 5,
    }

    const result = parseFilesWithFromFlux([CSV])
    expect(result).toEqual(expected)
  })

  test('can parse multi-csv response with values containing newlines', () => {
    const CSV = `
#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,0,howdy,5
,,0,"hello

there",5
,,0,hi,6

#group,false,false,false,false
#datatype,string,long,string,long
#default,_result,,,
,result,table,message,value
,,1,howdy,5
,,1,"hello

there",5
,,1,hi,6
`.trim()

    const expectedData = [
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '0', 'howdy', '5'],
      ['', '', '0', 'hello\n\nthere', '5'],
      ['', '', '0', 'hi', '6'],
      [],
      ['#group', 'false', 'false', 'false', 'false'],
      ['#datatype', 'string', 'long', 'string', 'long'],
      ['#default', '_result'],
      ['', 'result', 'table', 'message', 'value'],
      ['', '', '1', 'howdy', '5'],
      ['', '', '1', 'hello\n\nthere', '5'],
      ['', '', '1', 'hi', '6'],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 5,
    }

    expect(parseFilesWithFromFlux([CSV])).toEqual(expected)
  })

  test('does not crash when passed in an incomplete CSV', () => {
    const CSV = `#group,false,false,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true`

    const expected = {
      data: [[]],
      maxColumnCount: 0,
    }

    expect(() => {
      parseFilesWithFromFlux([CSV])
    }).not.toThrow()

    expect(parseFilesWithFromFlux([CSV])).toEqual(expected)
  })
  test('can parse objects in CSV', () => {
    const CSV = `#group,false,false,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string
#default,_result,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,env,host,hostname,nodename,orgID,ot_trace_sampled,query-role,role,source
,,0,2020-06-03T03:17:00Z,2020-06-03T03:18:00Z,2020-06-03T03:17:00.235373882Z,"{""request"":""howdy"",""error"":""something is wrong""}",request,query_log,stag01-us-east-4,queryd-v1-6c46d687dc-2t5r5,queryd-v1-6c46d687dc-2t5r5,gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6,342e059bf55331f9,false,unknown,queryd-v1,tasks`

    const expectedData = [
      [
        '#group',
        'false',
        'false',
        'true',
        'true',
        'false',
        'false',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
      ],
      [
        '#datatype',
        'string',
        'long',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
      ],
      ['#default', '_result'],
      [
        '',
        'result',
        'table',
        '_start',
        '_stop',
        '_time',
        '_value',
        '_field',
        '_measurement',
        'env',
        'host',
        'hostname',
        'nodename',
        'orgID',
        'ot_trace_sampled',
        'query-role',
        'role',
        'source',
      ],
      [
        '',
        '',
        '0',
        '2020-06-03T03:17:00.000Z',
        '2020-06-03T03:18:00.000Z',
        '2020-06-03T03:17:00.235Z',
        '{"request":"howdy","error":"something is wrong"}',
        'request',
        'query_log',
        'stag01-us-east-4',
        'queryd-v1-6c46d687dc-2t5r5',
        'queryd-v1-6c46d687dc-2t5r5',
        'gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6',
        '342e059bf55331f9',
        'false',
        'unknown',
        'queryd-v1',
        'tasks',
      ],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 18,
    }

    const result = parseFilesWithFromFlux([CSV])
    expect(result).toEqual(expected)

    expect(() => {
      JSON.parse(result.data[4][6])
    }).not.toThrow()
  })

  test('can parse nested objects in CSV', () => {
    const CSV = `#group,false,false,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string
#default,_result,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,env,host,hostname,nodename,orgID,ot_trace_sampled,query-role,role,source
,,0,2020-06-03T03:17:00Z,2020-06-03T03:18:00Z,2020-06-03T03:17:00.235373882Z,"{""request"":{""nested"":""property""},""error"":""file not found""}",request,query_log,stag01-us-east-4,queryd-v1-6c46d687dc-2t5r5,queryd-v1-6c46d687dc-2t5r5,gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6,342e059bf55331f9,false,unknown,queryd-v1,tasks`

    const expectedData = [
      [
        '#group',
        'false',
        'false',
        'true',
        'true',
        'false',
        'false',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
      ],
      [
        '#datatype',
        'string',
        'long',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
      ],
      ['#default', '_result'],
      [
        '',
        'result',
        'table',
        '_start',
        '_stop',
        '_time',
        '_value',
        '_field',
        '_measurement',
        'env',
        'host',
        'hostname',
        'nodename',
        'orgID',
        'ot_trace_sampled',
        'query-role',
        'role',
        'source',
      ],
      [
        '',
        '',
        '0',
        '2020-06-03T03:17:00.000Z',
        '2020-06-03T03:18:00.000Z',
        '2020-06-03T03:17:00.235Z',
        '{"request":{"nested":"property"},"error":"file not found"}',
        'request',
        'query_log',
        'stag01-us-east-4',
        'queryd-v1-6c46d687dc-2t5r5',
        'queryd-v1-6c46d687dc-2t5r5',
        'gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6',
        '342e059bf55331f9',
        'false',
        'unknown',
        'queryd-v1',
        'tasks',
      ],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 18,
    }

    const result = parseFilesWithFromFlux([CSV])
    expect(result).toEqual(expected)

    expect(() => {
      JSON.parse(result.data[4][6])
    }).not.toThrow()
  })

  test('can parse objects in multi-csv response', () => {
    const CSV = `#group,false,false,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string
#default,_result,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,env,host,hostname,nodename,orgID,ot_trace_sampled,query-role,role,source
,,0,2020-06-03T03:17:00Z,2020-06-03T03:18:00Z,2020-06-03T03:17:00.235373882Z,"{""request"":""howdy"",""error"":""something is wrong""}",request,query_log,stag01-us-east-4,queryd-v1-6c46d687dc-2t5r5,queryd-v1-6c46d687dc-2t5r5,gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6,342e059bf55331f9,false,unknown,queryd-v1,tasks

#group,false,false,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string
#default,_result,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,env,host,hostname,nodename,orgID,ot_trace_sampled,query-role,role,source
,,0,2020-06-03T03:17:00Z,2020-06-03T03:18:00Z,2020-06-03T03:17:00.235373882Z,"{""request0"":""yo"",""error"":""something is seriously wrong""}",request,query_log,stag01-us-east-4,queryd-v1-6c46d687dc-2t5r5,queryd-v1-6c46d687dc-2t5r5,gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6,342e059bf55331f9,false,unknown,queryd-v1,tasks
,,0,2020-06-03T03:17:00Z,2020-06-03T03:18:00Z,2020-06-03T03:17:00.235373882Z,"{""request1"":""hi"",""error"":""oops, another error""}",request,query_log,stag01-us-east-4,queryd-v1-6c46d687dc-2t5r5,queryd-v1-6c46d687dc-2t5r5,gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6,342e059bf55331f9,false,unknown,queryd-v1,tasks

#group,false,false,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string
#default,_result,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,env,host,hostname,nodename,orgID,ot_trace_sampled,query-role,role,source
,,0,2020-06-03T03:17:00Z,2020-06-03T03:18:00Z,2020-06-03T03:17:00.235373882Z,"{""request"":""greetings"",""error"":""file not found""}",request,query_log,stag01-us-east-4,queryd-v1-6c46d687dc-2t5r5,queryd-v1-6c46d687dc-2t5r5,gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6,342e059bf55331f9,false,unknown,queryd-v1,tasks

#group,false,false,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string
#default,_result,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,env,host,hostname,nodename,orgID,ot_trace_sampled,query-role,role,source
,,0,2020-06-03T03:17:00Z,2020-06-03T03:18:00Z,2020-06-03T03:17:00.235373882Z,"{""request99"":""hello"",""error"":""my name is bob""}",request,query_log,stag01-us-east-4,queryd-v1-6c46d687dc-2t5r5,queryd-v1-6c46d687dc-2t5r5,gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6,342e059bf55331f9,false,unknown,queryd-v1,tasks`

    const expectedData = [
      [
        '#group',
        'false',
        'false',
        'true',
        'true',
        'false',
        'false',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
        'true',
      ],
      [
        '#datatype',
        'string',
        'long',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'dateTime:RFC3339',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
        'string',
      ],
      ['#default', '_result'],
      [
        '',
        'result',
        'table',
        '_start',
        '_stop',
        '_time',
        '_value',
        '_field',
        '_measurement',
        'env',
        'host',
        'hostname',
        'nodename',
        'orgID',
        'ot_trace_sampled',
        'query-role',
        'role',
        'source',
      ],
      [
        '',
        '',
        '0',
        '2020-06-03T03:17:00.000Z',
        '2020-06-03T03:18:00.000Z',
        '2020-06-03T03:17:00.235Z',
        '{"request":"howdy","error":"something is wrong"}',
        'request',
        'query_log',
        'stag01-us-east-4',
        'queryd-v1-6c46d687dc-2t5r5',
        'queryd-v1-6c46d687dc-2t5r5',
        'gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6',
        '342e059bf55331f9',
        'false',
        'unknown',
        'queryd-v1',
        'tasks',
      ],
      [
        '',
        '',
        '0',
        '2020-06-03T03:17:00.000Z',
        '2020-06-03T03:18:00.000Z',
        '2020-06-03T03:17:00.235Z',
        '{"request0":"yo","error":"something is seriously wrong"}',
        'request',
        'query_log',
        'stag01-us-east-4',
        'queryd-v1-6c46d687dc-2t5r5',
        'queryd-v1-6c46d687dc-2t5r5',
        'gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6',
        '342e059bf55331f9',
        'false',
        'unknown',
        'queryd-v1',
        'tasks',
      ],
      [
        '',
        '',
        '0',
        '2020-06-03T03:17:00.000Z',
        '2020-06-03T03:18:00.000Z',
        '2020-06-03T03:17:00.235Z',
        '{"request1":"hi","error":"oops, another error"}',
        'request',
        'query_log',
        'stag01-us-east-4',
        'queryd-v1-6c46d687dc-2t5r5',
        'queryd-v1-6c46d687dc-2t5r5',
        'gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6',
        '342e059bf55331f9',
        'false',
        'unknown',
        'queryd-v1',
        'tasks',
      ],
      [
        '',
        '',
        '0',
        '2020-06-03T03:17:00.000Z',
        '2020-06-03T03:18:00.000Z',
        '2020-06-03T03:17:00.235Z',
        '{"request":"greetings","error":"file not found"}',
        'request',
        'query_log',
        'stag01-us-east-4',
        'queryd-v1-6c46d687dc-2t5r5',
        'queryd-v1-6c46d687dc-2t5r5',
        'gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6',
        '342e059bf55331f9',
        'false',
        'unknown',
        'queryd-v1',
        'tasks',
      ],
      [
        '',
        '',
        '0',
        '2020-06-03T03:17:00.000Z',
        '2020-06-03T03:18:00.000Z',
        '2020-06-03T03:17:00.235Z',
        '{"request99":"hello","error":"my name is bob"}',
        'request',
        'query_log',
        'stag01-us-east-4',
        'queryd-v1-6c46d687dc-2t5r5',
        'queryd-v1-6c46d687dc-2t5r5',
        'gke-stag01-us-east-4-highmem-preempti-6beb3a50-nsb6',
        '342e059bf55331f9',
        'false',
        'unknown',
        'queryd-v1',
        'tasks',
      ],
    ]

    const expected = {
      data: expectedData,
      maxColumnCount: 18,
    }

    const result = parseFilesWithFromFlux([CSV])

    expect(result).toEqual(expected)

    expect(() => {
      JSON.parse(result.data[4][6])
      JSON.parse(result.data[5][6])
      JSON.parse(result.data[6][6])
      JSON.parse(result.data[7][6])
      JSON.parse(result.data[8][6])
    }).not.toThrow()
  })

  test('should be able to parse multiple nested error objects of real data', () => {
    const expected = {
      data: [
        [
          '#group',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
        ],
        [
          '#datatype',
          'string',
          'long',
          'string',
          'dateTime:RFC3339',
          'dateTime:RFC3339',
          'dateTime:RFC3339',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
          'string',
        ],
        ['#default', '_result'],
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
        [],
        [
          '#group',
          'false',
          'false',
          'true',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
          'false',
        ],
        [
          '#datatype',
          'string',
          'long',
          'string',
          'long',
          'long',
          'long',
          'long',
          'long',
          'long',
          'long',
          'long',
          'long',
          'string',
          'string',
          'long',
          'long',
        ],
        ['#default', '_profiler'],
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
      maxColumnCount: 18,
    }

    const result = parseFilesWithFromFlux([CSV_WITH_OBJECTS])
    expect(result).toEqual(expected)
    expect(typeof result.data[4][7]).toEqual('string')
    expect(typeof result.data[5][7]).toEqual('string')
    expect(typeof result.data[6][7]).toEqual('string')
    expect(typeof result.data[7][7]).toEqual('string')
    expect(typeof result.data[8][7]).toEqual('string')
    expect(typeof result.data[9][7]).toEqual('string')
    expect(typeof result.data[10][7]).toEqual('string')
  })
})

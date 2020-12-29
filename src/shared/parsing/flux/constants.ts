// prettier-ignore
export const RESPONSE_METADATA = `#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string,string,string
#group,false,false,false,false,false,false,true,true,true,true
#default,_result,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,cpu,host
,,0,2018-05-23T17:42:29.536834648Z,2018-05-23T17:43:29.536834648Z,2018-05-23T17:42:29.654Z,0,usage_guest,cpu,cpu-total,WattsInfluxDB
`

export const RESPONSE_NO_METADATA = `,result,table,_start,_stop,_time,_value,_field,_measurement,cpu,host
,,0,2018-05-23T17:42:29.536834648Z,2018-05-23T17:43:29.536834648Z,2018-05-23T17:42:29.654Z,0,usage_guest,cpu,cpu-total,WattsInfluxDB

`

export const RESPONSE_NO_MEASUREMENT = `,result,table,_start,_stop,_time,_value,_field,cpu,host
,,0,2018-05-23T17:42:29.536834648Z,2018-05-23T17:43:29.536834648Z,2018-05-23T17:42:29.654Z,0,usage_guest,cpu-total,WattsInfluxDB`

export const EXPECTED_COLUMNS = [
  '',
  'result',
  'table',
  '_start',
  '_stop',
  '_time',
  '_value',
  '_field',
  '_measurement',
  'cpu',
  'host',
]

export const EXPECTED_METADATA = [
  [
    'datatype',
    'string',
    'long',
    'dateTime:RFC3339',
    'dateTime:RFC3339',
    'dateTime:RFC3339',
    'double',
    'string',
    'string',
    'string',
    'string',
  ],
  [
    'group',
    'false',
    'false',
    'false',
    'false',
    'false',
    'false',
    'true',
    'true',
    'true',
    'true',
  ],
  ['default', '_result', '', '', '', '', '', '', '', '', ''],
]

export const MEASUREMENTS_RESPONSE = `#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,string
#group,false,false,false,false,false,false
#default,_result,,,,,
,result,table,_start,_stop,_measurement,_value
,,0,2018-05-24T21:48:17.127227579Z,2018-05-24T22:48:17.127227579Z,disk,disk
,,0,2018-05-24T21:48:17.127227579Z,2018-05-24T22:48:17.127227579Z,diskio,diskio

`

/*
From the following request:

    from(db: "telegraf")
      |> range(start: -24h)
      |> group()
      |> keys(except:["_time","_value","_start","_stop"])
      |> map(fn: (r) => r._value)
*/
export const TAGS_RESPONSE = `#datatype,string,long,string
#group,false,false,false
#default,_result,,
,result,table,_value
,,0,_field
,,0,_measurement
,,0,cpu
,,0,device
,,0,fstype
,,0,host
,,0,mode
,,0,name
,,0,path
`

// prettier-ignore

export const SIMPLE = `
#group,false,false,true,true,false,false,true,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string,string,string
#default,Results,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,cpu,host
,,0,2018-09-10T22:34:26.854028Z,2018-09-10T22:35:26.854028Z,2018-09-10T22:34:29Z,0,usage_guest,cpu,cpu1,bertrand.local
,,0,2018-09-10T22:34:26.854028Z,2018-09-10T22:35:26.854028Z,2018-09-10T22:34:39Z,10,usage_guest,cpu,cpu1,bertrand.local


`
export const MULTI_SCHEMA_RESPONSE = `#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string,string,string
#group,false,false,false,false,false,false,true,true,true,true
#default,_result,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,cpu,host
,,0,1677-09-21T00:12:43.145224192Z,2018-05-22T22:39:17.042276772Z,2018-05-22T22:39:12.584Z,0,usage_guest,cpu,cpu-total,WattsInfluxDB
,,1,1677-09-21T00:12:43.145224192Z,2018-05-22T22:39:17.042276772Z,2018-05-22T22:39:12.584Z,0,usage_guest_nice,cpu,cpu-total,WattsInfluxDB

#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string,string,string,string,string
#group,false,false,false,false,false,false,true,true,true,true,true,true,true
#default,_result,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,device,fstype,host,mode,path
,,2,1677-09-21T00:12:43.145224192Z,2018-05-22T22:39:17.042276772Z,2018-05-04T21:05:08.947Z,182180679680,free,disk,/Users/watts/Downloads/TablePlus.app,nullfs,WattsInfluxDB,ro,/private/var/folders/f4/zd7n1rqj7xj6w7c0njkmmjlh0000gn/T/AppTranslocation/F4D8D166-F848-4862-94F6-B51C00E2EB7A
,,3,1677-09-21T00:12:43.145224192Z,2018-05-22T22:39:17.042276772Z,2018-05-04T21:05:08.947Z,9223372036852008920,inodes_free,disk,/Users/watts/Downloads/TablePlus.app,nullfs,WattsInfluxDB,ro,/private/var/folders/f4/zd7n1rqj7xj6w7c0njkmmjlh0000gn/T/AppTranslocation/F4D8D166-F848-4862-94F6-B51C00E2EB7A


`
export const MULTI_YIELD_CSV = `#group,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,double,dateTime:RFC3339
#default,mean,,,,,,,,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_field,_measurement,com.docker.compose.config-hash,com.docker.compose.container-number,com.docker.compose.oneoff,com.docker.compose.project,com.docker.compose.project.config_files,com.docker.compose.project.working_dir,com.docker.compose.service,com.docker.compose.version,container_image,container_name,container_status,container_version,cpu,engine_host,host,server_version,_value,_time
,,0,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.169788866995074,2020-10-06T20:55:17.321Z

#group,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,double,dateTime:RFC3339
#default,foo,,,,,,,,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_field,_measurement,com.docker.compose.config-hash,com.docker.compose.container-number,com.docker.compose.oneoff,com.docker.compose.project,com.docker.compose.project.config_files,com.docker.compose.project.working_dir,com.docker.compose.service,com.docker.compose.version,container_image,container_name,container_status,container_version,cpu,engine_host,host,server_version,_value,_time
,,0,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.169788866995074,2020-10-06T20:55:17.321Z
,,0,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.0242590121457487,2020-10-06T20:55:27.317Z

#group,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,double,dateTime:RFC3339
#default,baz,,,,,,,,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_field,_measurement,com.docker.compose.config-hash,com.docker.compose.container-number,com.docker.compose.oneoff,com.docker.compose.project,com.docker.compose.project.config_files,com.docker.compose.project.working_dir,com.docker.compose.service,com.docker.compose.version,container_image,container_name,container_status,container_version,cpu,engine_host,host,server_version,_value,_time
,,0,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.169788866995074,2020-10-06T20:55:17.321Z`

export const MULTI_YIELD_AND_TABLE_CSV = `#group,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,double,dateTime:RFC3339
#default,mean,,,,,,,,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_field,_measurement,com.docker.compose.config-hash,com.docker.compose.container-number,com.docker.compose.oneoff,com.docker.compose.project,com.docker.compose.project.config_files,com.docker.compose.project.working_dir,com.docker.compose.service,com.docker.compose.version,container_image,container_name,container_status,container_version,cpu,engine_host,host,server_version,_value,_time
,,0,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.169788866995074,2020-10-06T20:55:17.321Z

#group,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,double,dateTime:RFC3339
#default,foo,,,,,,,,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_field,_measurement,com.docker.compose.config-hash,com.docker.compose.container-number,com.docker.compose.oneoff,com.docker.compose.project,com.docker.compose.project.config_files,com.docker.compose.project.working_dir,com.docker.compose.service,com.docker.compose.version,container_image,container_name,container_status,container_version,cpu,engine_host,host,server_version,_value,_time
,,0,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.169788866995074,2020-10-06T20:55:17.321Z
,,1,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.0242590121457487,2020-10-06T20:55:27.317Z

#group,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,string,double,dateTime:RFC3339
#default,baz,,,,,,,,,,,,,,,,,,,,,,,
,result,table,_start,_stop,_field,_measurement,com.docker.compose.config-hash,com.docker.compose.container-number,com.docker.compose.oneoff,com.docker.compose.project,com.docker.compose.project.config_files,com.docker.compose.project.working_dir,com.docker.compose.service,com.docker.compose.version,container_image,container_name,container_status,container_version,cpu,engine_host,host,server_version,_value,_time
,,0,2020-10-06T20:55:09.9842563Z,2020-10-06T21:00:09.9842563Z,usage_percent,docker_container_cpu,f8671f6468549a5e81739babf890629f328ca986e1ed1bd5fe7f2529250e812f,1,False,influx,"compose/fig.cloud.yml,compose/fig.chronograf.oss.yml,compose/fig.chronograf.cloud.yml,compose/fig.local.yml",/Users/asalem/go/src/github.com/monitor-ci/compose,influxdb,1.25.4,quay.io/influxdb/idpe-acceptance,influx_influxdb_1,running,latest,cpu-total,docker-desktop,82c47d81f234,19.03.8,2.169788866995074,2020-10-06T20:55:17.321Z`

export const MULTI_VALUE_ROW = `
#datatype,string,long,dateTime:RFC3339,double,double,string
#group,false,false,false,false,false,true
#default,0,,,,,
,result,table,_time,mean_usage_idle,mean_usage_user,_measurement
,,0,2018-09-10T16:54:37Z,85,10,cpu
,,0,2018-09-10T16:54:38Z,87,7,cpu
,,0,2018-09-10T16:54:39Z,89,5,cpu
,,1,2018-09-10T16:54:37Z,8,1,mem
,,1,2018-09-10T16:54:38Z,9,2,mem
,,1,2018-09-10T16:54:39Z,10,3,mem


`

export const MIXED_DATATYPES = `
#datatype,string,long,dateTime:RFC3339,double,string,string
#group,false,false,false,false,false,true
#default,0,,,,,
,result,table,_time,mean_usage_idle,my_fun_col,_measurement
,,0,2018-09-10T16:54:37Z,85,foo,cpu
,,0,2018-09-10T16:54:39Z,89,foo,cpu
,,1,2018-09-10T16:54:37Z,8,bar,mem
,,1,2018-09-10T16:54:39Z,10,bar,mem


`

export const MISMATCHED = `
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#group,false,false,true,true,false,false,true,true,true
#default,_result,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,,0,2018-06-04T17:12:21.025984999Z,2018-06-04T17:13:00Z,2018-06-04T17:12:25Z,1,active,mem,bertrand.local
,,0,2018-06-04T17:12:21.025984999Z,2018-06-04T17:13:00Z,2018-06-04T17:12:35Z,2,active,mem,bertrand.local
,,1,2018-06-04T17:12:21.025984999Z,2018-06-04T17:13:00Z,2018-06-05T17:12:25Z,10,available,mem,bertrand.local
,,1,2018-06-04T17:12:21.025984999Z,2018-06-04T17:13:00Z,2018-06-05T17:12:35Z,11,available,mem,bertrand.local
`

export const TRUNCATED_RESPONSE = `
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string,string,string
#group,false,false,false,false,false,false,true,true,true,true
#default,_result,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,cpu,host
,,0,1677-09-21T00:12:43.145224192Z,2018-05-22T22:39:17.042276772Z,2018-05-22T22:39:12.584Z,0,usage_guest,cpu,cpu-total,WattsInfluxDB
,,1,1677-09-21T00:12:43.145224192Z,2018-05-22T22:39:17.042276772Z,2018-05-22T22:39:12.584Z,0,usage_guest_nice,cpu,cpu-total,WattsInfluxDB

#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string,string,string,string,string
#group,false,false,false,false,false,false,true,true,true,true,true,true,true
#default,_result,,,,,,,,,,,,`

export const CSV_WITH_OBJECTS = `#group,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,string,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string,string,string,string
#default,_result,,,,,,,,,,,,,,,,
,result,table,_field,_start,_stop,_time,_value,env,error,errorCode,errorType,host,hostname,nodename,orgID,request,source
,,0,request,2020-09-02T12:00:00Z,2020-09-02T13:00:00Z,2020-09-02T12:51:01.660882959Z,"{""request"":{""organization_id"":""a2ec9780bc3b0e58"",""compiler"":{""Now"":""2020-09-02T12:51:01.65041241Z"",""query"":""from(bucket: \""ExtranetDumpCustomerTag\"")\n  |\u003e range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |\u003e filter(fn: (r) =\u003e r[\""_measurement\""] == \""EnergyValue\"")\n  |\u003e filter(fn: (r) =\u003e r[\""_field\""] == \""current1\"")\n  |\u003e filter(fn: (r) =\u003e r[\""customer\""] == '')\n  |\u003e aggregateWindow(every: 1d, fn: mean, createEmpty: false)\n  |\u003e yield(name: \""mean\"")""},""source"":""Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"",""compiler_type"":""flux""},""dialect"":{""header"":true,""delimiter"":"","",""annotations"":[""group"",""datatype"",""default""]},""dialect_type"":""csv""}",prod01-eu-central-1,compilation failed: error at @5:13-5:42: invalid expression @5:41-5:42: ',invalid,user,queryd-v1-d6b75bfbc-5mpmf,queryd-v1-d6b75bfbc-5mpmf,ip-10-153-10-96.eu-central-1.compute.internal,a2ec9780bc3b0e58,"from(bucket: ""ExtranetDumpCustomerTag"")  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)  |> filter(fn: (r) => r[""_measurement""] == ""EnergyValue"")  |> filter(fn: (r) => r[""_field""] == ""current1"")  |> filter(fn: (r) => r[""customer""] == '')  |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)  |> yield(name: ""mean"")",Chrome
,,0,request,2020-09-02T12:00:00Z,2020-09-02T13:00:00Z,2020-09-02T12:20:49.452876991Z,"{""request"":{""organization_id"":""a2ec9780bc3b0e58"",""compiler"":{""Now"":""2020-09-02T12:20:49.439287155Z"",""query"":""from(bucket: \""ExtranetDumpCustomerTag\"")\n|\u003erange(start: \""2015-02-09 11:38:00.000\"", stop: \""2015-02-09 11:40:00.000\"")\n|\u003efilter(fn: (r) =\u003e r[\""_measurement\""] ==\""EnergyValue\"")\n|\u003eyield()\n\n""},""source"":""Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"",""compiler_type"":""flux""},""dialect"":{""header"":true,""delimiter"":"","",""annotations"":[""group"",""datatype"",""default""]},""dialect_type"":""csv""}",prod01-eu-central-1,"error calling function ""yield"": error calling function ""filter"": error calling function ""range"": value is not a time, got string",invalid,user,queryd-v1-d6b75bfbc-2zlj8,queryd-v1-d6b75bfbc-2zlj8,ip-10-153-10-96.eu-central-1.compute.internal,a2ec9780bc3b0e58,"from(bucket: ""ExtranetDumpCustomerTag"")|>range(start: ""2015-02-09 11:38:00.000"", stop: ""2015-02-09 11:40:00.000"")|>filter(fn: (r) => r[""_measurement""] ==""EnergyValue"")|>yield()",Chrome
,,0,request,2020-09-02T12:00:00Z,2020-09-02T13:00:00Z,2020-09-02T12:01:25.234216651Z,"{""request"":{""organization_id"":""bae87e9ccb059b86"",""compiler"":{""Now"":""2020-09-02T12:01:25.175728724Z"",""query"":""from(bucket: \""observations\"")\r\n  |\u003e range(start: v.timeRangeStart, stop: v.timeRangeStop)\r\n  |\u003e filter(fn: (r) =\u003e r[\""_measurement\""] == \""lkx\"" or r[\""_measurement\""] == \""weather\"")\r\n  |\u003e filter(fn: (r) =\u003e r[\""Alias\""] == \""LKX201-2\"")\r\n  |\u003e filter(fn: (r) =\u003e r[\""_field\""] == \""WindDirection\"")\r\n  |\u003e filter(fn: (r) =\u003e r[\""_value\""] \u003c= 359)\r\n  |\u003e aggregateWindow(every: v.windowPeriod, fn: median, createEmpty: false)\r\n  |\u003e yield(name: \""median\"")""},""source"":""Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"",""compiler_type"":""flux""},""dialect"":{""header"":true,""delimiter"":"","",""annotations"":[""group"",""datatype"",""default""]},""dialect_type"":""csv""}",prod01-eu-central-1,unsupported aggregate column type int; unsupported aggregate column type int,invalid,user,queryd-v1-d6b75bfbc-z5cmc,queryd-v1-d6b75bfbc-z5cmc,ip-10-153-10-33.eu-central-1.compute.internal,bae87e9ccb059b86,"rom(bucket: ""observations"")\r  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\r  |> filter(fn: (r) => r[""_measurement""] == ""lkx"" or r[""_measurement""] == ""weather"")\r  |> filter(fn: (r) => r[""Alias""] == ""LKX201-2"")\r  |> filter(fn: (r) => r[""_field""] == ""WindDirection"")\r  |> filter(fn: (r) => r[""_value""] \u003c= 359)\r  |> aggregateWindow(every: v.windowPeriod, fn: median, createEmpty: false)\r  |> yield(name: ""median"")",Chrome
,,0,request,2020-09-02T12:00:00Z,2020-09-02T13:00:00Z,2020-09-02T12:05:02.640381338Z,"{""request"":{""organization_id"":""a2ec9780bc3b0e58"",""compiler"":{""Now"":""2020-09-02T12:05:02.620536688Z"",""query"":""from(bucket: \""ExtranetDumpCustomerTag\"")\n  |\u003e range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |\u003e filter(fn: (r) =\u003e r[\""_measurement\""] == \""WeatherValue\"")\n  |\u003e aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |\u003e yield(name: \""mean\"")""},""source"":""Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"",""compiler_type"":""flux""},""dialect"":{""header"":true,""delimiter"":"","",""annotations"":[""group"",""datatype"",""default""]},""dialect_type"":""csv""}",prod01-eu-central-1,unsupported input type for mean aggregate: boolean; unsupported input type for mean aggregate: boolean,invalid,user,queryd-v1-d6b75bfbc-kznb5,queryd-v1-d6b75bfbc-kznb5,ip-10-153-10-149.eu-central-1.compute.internal,a2ec9780bc3b0e58,"from(bucket: ""ExtranetDumpCustomerTag"")  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)  |> filter(fn: (r) => r[""_measurement""] == ""WeatherValue"")  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)  |> yield(name: ""mean"")",Chrome
,,0,request,2020-09-02T12:00:00Z,2020-09-02T13:00:00Z,2020-09-02T12:03:30.69488328Z,"{""request"":{""organization_id"":""dc56bb3c07ec663c"",""compiler"":{""Now"":""2020-09-02T12:03:30.679008917Z"",""query"":""SELECT * from MyDB""},""source"":""Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0"",""compiler_type"":""flux""},""dialect"":{""header"":true,""delimiter"":"","",""annotations"":[""group"",""datatype"",""default""]},""dialect_type"":""csv""}",prod01-eu-west-1,error @1:1-1:7: undefined identifier SELECT,invalid,user,queryd-v1-668bbdcf74-5m4n2,queryd-v1-668bbdcf74-5m4n2,aks-storage-23576596-vmss00000u,dc56bb3c07ec663c,SELECT * from MyDB,Firefox
,,0,request,2020-09-02T12:00:00Z,2020-09-02T13:00:00Z,2020-09-02T12:15:16.019716561Z,"{""request"":{""organization_id"":""dc56bb3c07ec663c"",""compiler"":{""Now"":""2020-09-02T12:15:16.002284529Z"",""query"":""data = from(bucket: \""db/MyDB\"")\r\n  \r\n""},""source"":""Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0"",""compiler_type"":""flux""},""dialect"":{""header"":true,""delimiter"":"","",""annotations"":[""group"",""datatype"",""default""]},""dialect_type"":""csv""}",prod01-eu-west-1,"error in query specification while starting program: this Flux script returns no streaming data. Consider adding a ""yield"" or invoking streaming functions directly, without performing an assignment",invalid,user,queryd-v1-668bbdcf74-87t2j,queryd-v1-668bbdcf74-87t2j,aks-storage-23576596-vmss00000w,dc56bb3c07ec663c,"data = from(bucket: ""db/MyDB"")\r  \r",Firefox
,,0,request,2020-09-02T12:00:00Z,2020-09-02T13:00:00Z,2020-09-02T12:29:49.06643776Z,"{""request"":{""organization_id"":""c86c6a73dbfd08b8"",""compiler"":{""Now"":""2020-09-02T12:29:49.041696404Z"",""query"":""from(bucket: \""cronjobs\"")\n  |\u003e range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |\u003e filter(fn: (r) =\u003e r[\""_measurement\""] == \""iconico-cronjobs-5ed512ac09c51c0bea12ec55\"")\n  |\u003e filter(fn: (r) =\u003e r[\""_field\""] == \""msg\"")\n  |\u003e aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)\n  |\u003e yield(name: \""mean\"")""},""source"":""Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36"",""compiler_type"":""flux""},""dialect"":{""header"":true,""delimiter"":"","",""annotations"":[""group"",""datatype"",""default""]},""dialect_type"":""csv""}",prod01-us-central-1,unsupported input type for mean aggregate: string; unsupported input type for mean aggregate: string,invalid,user,queryd-v1-dc8994845-67z87,queryd-v1-dc8994845-67z87,gke-prod01-us-central-1-highmem1-4bc74378-dbm8,c86c6a73dbfd08b8,"from(bucket: ""cronjobs"")  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)  |> filter(fn: (r) => r[""_measurement""] == ""iconico-cronjobs-5ed512ac09c51c0bea12ec55"")  |> filter(fn: (r) => r[""_field""] == ""msg"")  |> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)  |> yield(name: ""mean"")",Chrome

#group,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false
#datatype,string,long,string,long,long,long,long,long,long,long,long,long,string,string,long,long
#default,_profiler,,,,,,,,,,,,,,,
,result,table,_measurement,TotalDuration,CompileDuration,QueueDuration,PlanDuration,RequeueDuration,ExecuteDuration,Concurrency,MaxAllocated,TotalAllocated,RuntimeErrors,flux/query-plan,influxdb/scanned-bytes,influxdb/scanned-values
,,0,profiler/query,41826554659,2390321,41026,0,0,41824071714,0,326272,0,,"digraph {
  merged_ReadRange_filter2
  map3
  map4
  map5
  map6
  map7
  filter8
  // r.request !~ <semantic format error, unknown node *semantic.RegexpLiteral>
  drop9
  // DualImplProcedureSpec, UseDeprecated = false
  group10
  yield11

  merged_ReadRange_filter2 -> map3
  map3 -> map4
  map4 -> map5
  map5 -> map6
  map6 -> map7
  map7 -> filter8
  filter8 -> drop9
  drop9 -> group10
  group10 -> yield11
}
",156253,27
`

import {extractTableId} from './fluxData'

describe('fluxData utils methods', () => {
  describe('extractTableId', () => {
    it('can handle schema data', () => {
      const str =
        '#group,false,false,false\r\n#datatype,string,long,string\r\n#default,_result,,\r\n,result,table,_value\r\n,,0,code\r\n,,0,crypto\r\n,,0,description\r\n,,0,id\r\n,,0,location\r\n,,0,magType\r\n,,0,net\r\n,,0,randtag\r\n,,0,sensor_id\r\n,,0,station_id\r\n,,0,station_name\r\n,,0,station_owner\r\n,,0,station_pgm\r\n,,0,station_type\r\n,,0,symbol\r\n,,0,title\r\n\r\n'

      expect(extractTableId(str)).toEqual(0)
    })

    it('can handle multiple tables', () => {
      const str =
        '#group,false,false,true,true,false,false,true,true,true,true,true,true,true\r\n#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string,string,string,string,string\r\n#default,_editor_composition,,,,,,,,,,,,\r\n,result,table,_start,_stop,_time,_value,_field,_measurement,code,id,magType,net,title\r\n,,15,2022-09-03T22:08:07.078934177Z,2022-10-03T22:08:07.078934177Z,2022-09-30T00:40:21.73Z,0,tsunami,chemical explosion,73787416,nc73787416,md,nc,"M 1.9 Chemical Explosion - 8km WSW of Mountain House, CA"\r\n\r\n#group,false,false,true,true,false,false,true,true,true,true,true,true,true\r\n#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string\r\n#default,_editor_composition,,,,,,,,,,,,\r\n,result,table,_start,_stop,_time,_value,_field,_measurement,code,id,magType,net,title\r\n,,16,2022-09-03T22:08:07.078934177Z,2022-10-03T22:08:07.078934177Z,2022-09-30T00:40:21.73Z,https://earthquake.usgs.gov/earthquakes/eventpage/nc73787416,url,chemical explosion,73787416,nc73787416,md,nc,"M 1.9 Chemical Explosion - 8km WSW of Mountain House, CA"\r\n\r\n'

      expect(extractTableId(str)).toEqual(16)
    })

    it('can handle fragmented table data', () => {
      const str =
        ',mb,us,"M 4.5 - 44 km ESE of Uchiza, Peru"\r\n\r\n#group,false,false,true,true,false,false,true,true,true,true,true,true,true\r\n#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,string,string,string,string\r\n#default,_editor_composition,,,,,,,,,,,,\r\n,result,table,_start,_stop,_time,_value,_field,_measurement,code,id,magType,net,title\r\n,,4466,2022-10-02T22:28:26.601022177Z,2022-10-03T22:28:26.601022177Z,2022-10-02T22:32:43.42Z,",nc,",sources,earthquake,73788626,nc73788626,md,nc,"M 0.2 - 6km NW of The Geysers, CA"\r\n\r\n#group,false,false,true,true,false,false,true,true,true,true,true,true,true\r\n#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string,string,string,string,string,string\r\n#default,_editor_composition,,,,,,,,,,,,\r\n,result,table,_start,_stop,_time,_value,_field,_measurement,code,id,magType,net,title\r\n,,4467,2022-10-02T22:28:26.601022177Z,2022-10-03T22:28:26.601022177'
      expect(extractTableId(str)).toEqual(4467)

      const str2 =
        '1Z,0,tsunami,earthquake,73788911,nc73788911,md,nc,"M 1.3 - 2km ENE of The Geysers, CA"\r\n\r\n#group,false,false,true,true,false,false,true,true,true,true,true,true,true\r\n#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,double,string,string,string,string,string,string,string\r\n#default,_editor_composition,,,,,,,,,,,,\r\n,result,table,_start,_stop,_time,_value,_field,_measurement,code,id,magType,net,title\r\n,,2838,2022-10-02T22:28:26.601022177Z,2022-10-03T22:28:26.601022177Z,2022-10-03T07:36:14.286Z,1.9,mag,earthquake,022cokpkc1,ak022cokpkc1,ml,ak,"M 1.9 - 64 km E of Port Alsworth, Alaska"\r\n,,2839,2022-10-02T22:28:26.601022177Z,2022-10-03T22:28:26.601022177Z,2022-10-03T16:39:21.466Z,4.4,mag,earthquake,6000iqfl,us6000iqfl,mb,us,"M 4.4 - 50 km ENE of Mutsu, Japan"\r\n\r\n#group,false,false,true,true,false,false,true,true,true,true,true,true,true\r\n#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,string,string,string,string,stri'
      expect(extractTableId(str2)).toEqual(2839)
    })
  })
})

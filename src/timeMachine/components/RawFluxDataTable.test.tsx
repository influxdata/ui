import React from 'react'
import {screen} from '@testing-library/react'
import {fromFlux} from '@influxdata/giraffe'
import {renderWithReduxAndRouter} from 'src/mockState'

import RawFluxDataTable from 'src/timeMachine/components/RawFluxDataTable'

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

describe('RawFluxDataTable', () => {
  test('it can render a simple grid from a flux response', async () => {
    const data = fromFlux(MULTI_SCHEMA_RESPONSE)
    renderWithReduxAndRouter(
      <RawFluxDataTable parsedResults={data} width={10000} height={10000} />
    )

    const group = await screen.findAllByTestId(
      'raw-flux-data-table--cell #group'
    )
    const datatype = await screen.findAllByTestId(
      'raw-flux-data-table--cell #datatype'
    )
    const date = await screen.findAllByTestId(
      'raw-flux-data-table--cell 1677-09-21T00:12:43.145Z'
    )

    expect(group[0]).toBeVisible()
    expect(group.length).toEqual(4)
    expect(datatype[0]).toBeVisible()
    expect(datatype.length).toEqual(4)
    expect(date[0]).toBeVisible()
    expect(date.length).toEqual(4)
  })
})

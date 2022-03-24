// Libraries
import React, {FC, useContext} from 'react'
import {Panel, ComponentSize, InfluxColors} from '@influxdata/clockface'

// Components
import {View} from 'src/visualization'
import {UsageContext} from 'src/usage/context/usage'

// Types
import {
  RemoteDataState,
  XYViewProperties,
  InternalFromFluxResult,
  UsageVector,
} from 'src/types'
import {fromFlux} from '@influxdata/giraffe'

interface Props {
  usageVector: UsageVector
  fromFluxResult: InternalFromFluxResult
  status: RemoteDataState
}

const UsageXYGraph: FC<Props> = ({usageVector, fromFluxResult, status}) => {
  const {timeRange} = useContext(UsageContext)

  const xyProperties: XYViewProperties = {
    showNoteWhenEmpty: true,
    colors: [],
    queries: [],
    note: '',
    type: 'xy',
    shape: 'chronograf-v2',
    axes: {
      x: {},
      y: {},
    },
    position: 'overlaid',
    yColumn: usageVector.fluxKey,
    geom: 'line',
    legendHide: true,
    staticLegend: {
      show: false,
    },
  }

  const error = fromFluxResult?.table?.columns?.error?.data?.[0]

  // I couldn't get the usage working with remocal so I am "faking" the query CSV.
  const csv = `#group,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,long,double
#default,reads_gb,,,,
,result,table,_time,_value,reads_gb
,,0,2022-03-23T08:00:00Z,0,0
,,0,2022-03-23T09:00:00Z,0,0
,,0,2022-03-23T10:00:00Z,0,0
,,0,2022-03-23T11:00:00Z,0,0
,,0,2022-03-23T12:00:00Z,0,0
,,0,2022-03-23T13:00:00Z,0,0
,,0,2022-03-23T14:00:00Z,0,0
,,0,2022-03-23T15:00:00Z,0,0
,,0,2022-03-23T16:00:00Z,0,0
,,0,2022-03-23T17:00:00Z,0,0
,,0,2022-03-23T18:00:00Z,6,0
,,0,2022-03-23T19:00:00Z,0,0
,,0,2022-03-23T20:00:00Z,0,0
,,0,2022-03-23T21:00:00Z,0,0
,,0,2022-03-23T22:00:00Z,0,0
,,0,2022-03-23T23:00:00Z,0,0
,,0,2022-03-24T00:00:00Z,0,0
,,0,2022-03-24T01:00:00Z,0,0
,,0,2022-03-24T02:00:00Z,0,0
,,0,2022-03-24T03:00:00Z,0,0
,,0,2022-03-24T04:00:00Z,0,0
,,0,2022-03-24T05:00:00Z,0,0
,,0,2022-03-24T06:00:00Z,0,0
,,0,2022-03-24T07:00:00Z,0,0
,,0,2022-03-24T07:02:59.333315911Z,0,0

`
  fromFluxResult = fromFlux(csv)

  return (
    <Panel
      backgroundColor={InfluxColors.Grey5}
      className="graph-type--panel"
      testID="graph-type--panel"
    >
      <Panel.Header
        size={ComponentSize.ExtraSmall}
        testID="usage-xy-graph--header"
      >
        <h5>{`${usageVector.name} ${
          usageVector.unit !== '' ? `(${usageVector.unit})` : ''
        }`}</h5>
      </Panel.Header>
      <Panel.Body className="panel-body--size" style={{height: 250}}>
        <View
          loading={status}
          error={`${error ?? ''}`}
          properties={xyProperties}
          result={fromFluxResult}
          timeRange={timeRange}
        />
      </Panel.Body>
    </Panel>
  )
}

export default UsageXYGraph

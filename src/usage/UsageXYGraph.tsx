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

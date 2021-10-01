// Libraries
import React, {FC, useContext} from 'react'
import {Panel, ComponentSize, InfluxColors} from '@influxdata/clockface'

// Components
import {View} from 'src/visualization'
import {UsageContext} from 'src/usage/context/usage'

// Types
import {
  SingleStatViewProperties,
  InternalFromFluxResult,
  UsageVector,
} from 'src/types'

interface Props {
  usageVector: UsageVector
  fromFluxResult: InternalFromFluxResult
  length?: number
}

const UsageSingleStat: FC<Props> = ({
  usageVector,
  fromFluxResult,
  length = 1,
}) => {
  const {timeRange, billingStatsStatus} = useContext(UsageContext)
  const singleStatProperties: SingleStatViewProperties = {
    colors: [],
    queries: [],
    note: '',
    showNoteWhenEmpty: true,
    prefix: '',
    tickPrefix: '',
    tickSuffix: '',
    type: 'single-stat',
    shape: 'chronograf-v2',
    suffix: ` ${usageVector?.unit ?? ''}`,
    decimalPlaces: {isEnforced: false, digits: 0},
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
        testID="usage-single-stat--header"
      >
        <h5>{`${usageVector.name} ${
          usageVector.unit !== '' ? `(${usageVector.unit})` : ''
        }`}</h5>
      </Panel.Header>
      <Panel.Body className="panel-body--size" style={{height: 300 / length}}>
        <View
          loading={billingStatsStatus}
          error={`${error ?? ''}`}
          properties={singleStatProperties}
          result={fromFluxResult}
          timeRange={timeRange}
        />
      </Panel.Body>
    </Panel>
  )
}

export default UsageSingleStat

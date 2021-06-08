// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Panel, ComponentSize, InfluxColors} from '@influxdata/clockface'
import {FromFluxResult} from '@influxdata/giraffe'

// Components
import {View} from 'src/visualization'

// Utils
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'

// Types
import {
  SingleStatViewProperties,
  RemoteDataState,
  XYViewProperties,
  InternalFromFluxResult,
} from 'src/types'

interface OwnProps {
  graphInfo: any
  fromFluxResult: InternalFromFluxResult | FromFluxResult
  length?: number
}

const GENERIC_PROPERTY_DEFAULTS = {
  colors: [],
  queries: [],
  note: 'No Data to Display',
  showNoteWhenEmpty: true,
  prefix: '',
  suffix: '',
  tickPrefix: '',
  tickSuffix: '',
}

const GraphTypeSwitcher: FC<OwnProps> = ({
  graphInfo,
  fromFluxResult,
  length = 1,
}) => {
  const timeRange = useSelector(getTimeRangeWithTimezone)

  const singleStatProperties: SingleStatViewProperties = {
    ...GENERIC_PROPERTY_DEFAULTS,
    type: 'single-stat',
    shape: 'chronograf-v2',
    suffix: ` ${graphInfo?.units ?? ''}`,
    decimalPlaces: {isEnforced: true, digits: 2},
  }

  const xyProperties: XYViewProperties = {
    ...GENERIC_PROPERTY_DEFAULTS,
    type: 'xy',
    shape: 'chronograf-v2',
    axes: {
      x: {},
      y: {},
    },
    position: 'overlaid',
    geom: 'line',
  }

  const isXy = graphInfo?.type === 'xy'

  return (
    <Panel
      backgroundColor={InfluxColors.Raven}
      className="graph-type--panel"
      testID="graph-type--panel"
    >
      <Panel.Header size={ComponentSize.ExtraSmall}>
        <h5>{graphInfo?.title}</h5>
      </Panel.Header>
      <Panel.Body
        className="panel-body--size"
        style={{height: isXy ? 250 : 200 / length}}
      >
        <View
          loading={RemoteDataState.Done}
          error=""
          isInitial={false}
          properties={isXy ? xyProperties : singleStatProperties}
          result={fromFluxResult}
          timeRange={timeRange}
        />
      </Panel.Body>
    </Panel>
  )
}

export default GraphTypeSwitcher

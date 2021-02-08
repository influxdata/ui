// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'
import {Panel, ComponentSize, InfluxColors} from '@influxdata/clockface'
import {fromFlux} from '@influxdata/giraffe'

// Components
import {View} from 'src/visualization'

// Utils
import {getTimeRangeWithTimezone, getTimeZone} from 'src/dashboards/selectors'

// Types
import {
  SingleStatViewProperties,
  RemoteDataState,
  XYViewProperties,
} from 'src/types'

interface OwnProps {
  graphInfo: any
  csv: string
}

const GENERIC_PROPERTY_DEFAULTS = {
  colors: [],
  queries: [],
  note: 'No Date to Display',
  showNoteWhenEmpty: true,
  prefix: '',
  suffix: '',
  tickPrefix: '',
  tickSuffix: '',
  legend: undefined,
}

const GraphTypeSwitcher: FC<OwnProps> = ({graphInfo, csv}) => {
  const giraffeResult = fromFlux(csv)

  const timeRange = useSelector(getTimeRangeWithTimezone)
  const timeZone = useSelector(getTimeZone)

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
    legend: {
      type: 'static',
      orientation: 'top',
    },
    position: 'overlaid',
    geom: 'line',
  }

  const graphTypeClassname = classnames('panel-body--size', {
    'usage-plot': graphInfo.type === 'sparkline',
  })

  return (
    <Panel
      backgroundColor={InfluxColors.Raven}
      className="graph-type--panel"
      testID="graph-type--panel"
    >
      <Panel.Header size={ComponentSize.ExtraSmall}>
        <h5>{graphInfo.title}</h5>
      </Panel.Header>
      <Panel.Body className={graphTypeClassname}>
        <View
          loading={RemoteDataState.Done}
          error=""
          isInitial={false}
          properties={
            graphInfo.type === 'stat' ? singleStatProperties : xyProperties
          }
          result={giraffeResult}
          timeRange={timeRange}
          timeZone={timeZone}
          theme="dark"
        />
      </Panel.Body>
    </Panel>
  )
}

export default GraphTypeSwitcher

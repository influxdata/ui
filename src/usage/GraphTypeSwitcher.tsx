// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'
import {Panel, ComponentSize, InfluxColors} from '@influxdata/clockface'
import {fromFlux} from '@influxdata/giraffe'

// Components
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'

// Utils
import {checkResultsLength} from 'src/shared/utils/vis'
import {getTimeRangeWithTimezone, getTimeZone} from 'src/dashboards/selectors'

// Types
import {RemoteDataState} from 'src/types'
import {SingleStatViewProperties, XYViewProperties} from 'src/client'

interface OwnProps {
  graphInfo: any
  csv: string
}

const GraphTypeSwitcher: FC<OwnProps> = ({graphInfo, csv}) => {
  const giraffeResult = fromFlux(csv)

  const timeRange = useSelector(getTimeRangeWithTimezone)
  const timeZone = useSelector(getTimeZone)

  const singleStatProperties = {
    type: 'single-stat',
    colors: [],
    shape: 'chronograf-v2',
    showNoteWhenEmpty: false,
    prefix: '',
    suffix: ` ${graphInfo?.units ?? ''}`,
    decimalPlaces: [{isEnforced: true, digits: 2}],
  }

  const xyProperties = {
    type: 'xy',
    // queries: DashboardQuery[]
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
    <Panel backgroundColor={InfluxColors.Kevlar} className="graph-type--panel">
      <Panel.Header size={ComponentSize.ExtraSmall}>
        <h5>{graphInfo.title}</h5>
      </Panel.Header>
      <Panel.Body className={graphTypeClassname}>
        <EmptyQueryView
          loading={RemoteDataState.Done}
          errorFormat={ErrorFormat.Scroll}
          // TODO(ariel): set the error message eventually
          // errorMessage={"Whoops, looks like there was an issue with your query"}
          isInitialFetch={false}
          hasResults={checkResultsLength(giraffeResult)}
        >
          <ViewSwitcher
            giraffeResult={giraffeResult}
            timeRange={timeRange}
            properties={
              graphInfo.type === 'stat' ? singleStatProperties : xyProperties
            }
            timeZone={timeZone}
            theme="dark"
          />
        </EmptyQueryView>
      </Panel.Body>
    </Panel>
  )
}

export default GraphTypeSwitcher

import React, {FC} from 'react'
import {useSelector} from 'react-redux'

import SparkLine from 'src/usage/SparkLine'
import SingleStat from 'src/usage/SingleStat'
import {Panel, InfluxColors, ComponentSize} from '@influxdata/clockface'
import {fromFlux} from '@influxdata/giraffe'
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ViewSwitcher from 'src/shared/components/ViewSwitcher'
import {checkResultsLength} from 'src/shared/utils/vis'
import {getTimeRangeWithTimezone, getTimeZone} from 'src/dashboards/selectors'

import {decimalPlaces, lineColors} from 'src/dashboards/resources'

import {RemoteDataState} from 'src/types'

interface OwnProps {
  graphInfo: any
  status: string
  csv: string
}

const GraphTypeSwitcher: FC<OwnProps> = ({graphInfo, status, csv}) => {
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

  // const xyProperties = {
  //   type: 'xy',
  //   timeFormat?: string
  //   queries: DashboardQuery[]
  //   colors: DashboardColor[]
  //   shape: 'chronograf-v2'
  //   note: string
  //   showNoteWhenEmpty: boolean
  //   axes: Axes
  //   legend: Legend
  //   xColumn?: string
  //   generateXAxisTicks?: string[]
  //   xTotalTicks?: number
  //   xTickStart?: number
  //   xTickStep?: number
  //   yColumn?: string
  //   generateYAxisTicks?: string[]
  //   yTotalTicks?: number
  //   yTickStart?: number
  //   yTickStep?: number
  //   shadeBelow?: boolean
  //   hoverDimension?: 'auto' | 'x' | 'y' | 'xy'
  //   position: 'overlaid' | 'stacked'
  //   geom: XYGeom
  //   legendColorizeRows?: boolean
  //   legendOpacity?: number
  //   legendOrientationThreshold?: number
  // }
  // // TODO(ariel): different based on whether the type is a single stat or xy
  // const properties = {
  //   type: graphInfo.type === 'stat' ? 'single-stat' : 'xy',
  // }
  if (graphInfo.type === 'stat') {
    console.log({graphInfo, giraffeResult})
    return (
      <Panel backgroundColor={InfluxColors.Onyx}>
        <Panel.Header size={ComponentSize.ExtraSmall}>
          <h5>{graphInfo.title}</h5>
        </Panel.Header>
        <Panel.Body className="panel-body--size">
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
              properties={singleStatProperties}
              timeZone={timeZone}
              theme="dark"
            />
          </EmptyQueryView>
        </Panel.Body>
      </Panel>
    )
  }
  return <div />
  // switch (status) {
  //   case QUERY_RESULTS_STATUS_ERROR:
  //     return <EmptyGraph title={graphInfo.title} isError={true} />

  //   case QUERY_RESULTS_STATUS_TIMEOUT:
  //     return (
  //       <EmptyGraph
  //         title={graphInfo.title}
  //         isError={true}
  //         errorMessage="Query has timed out"
  //       />
  //     )

  //   case QUERY_RESULTS_STATUS_EMPTY:
  //     return <EmptyGraph title={graphInfo.title} isError={false} />

  //   default:
  //     if (graphInfo.type === 'xy') {
  //       return <SparkLine {...graphInfo} table={table} />
  //     }

  //     if (graphInfo.type === 'single-stat') {
  //       return <SingleStat {...graphInfo} table={table} />
  //     }

  //     return <div />
  // }
}

export default GraphTypeSwitcher

// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Components
import TimeSeries from 'src/shared/components/TimeSeries'
import {View} from 'src/visualization'

import CellEvent from 'src/perf/components/CellEvent'

// Utils
import {GlobalAutoRefresher} from 'src/utils/AutoRefresher'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'
import {getActiveTimeRange, getAnnotations} from 'src/timeMachine/selectors'

// Types
import {
  AppState,
  DashboardQuery,
  QueryViewProperties,
  AnnotationsList,
  TimeRange,
} from 'src/types'

interface OwnProps {
  id: string
  incrementSubmitToken: () => void
  manualRefresh: number
  properties: QueryViewProperties
  submitToken: number
  transmitWindowPeriod?: (windowPeriod: number | string) => void
}

interface StateProps {
  annotations: AnnotationsList
  timeRange: TimeRange
  ranges: TimeRange | null
}

type Props = OwnProps & StateProps

class RefreshingView extends PureComponent<Props> {
  public static defaultProps = {
    inView: true,
    manualRefresh: 0,
  }

  constructor(props) {
    super(props)
  }

  public componentDidMount() {
    GlobalAutoRefresher.subscribe(this.props.incrementSubmitToken)
  }

  public componentWillUnmount() {
    GlobalAutoRefresher.unsubscribe(this.props.incrementSubmitToken)
  }

  public render() {
    const {
      id,
      ranges,
      properties,
      manualRefresh,
      annotations,
      submitToken,
      transmitWindowPeriod,
    } = this.props

    // DO NOT REMOVE the CellEvent component.  it gathers metrics for performance that management requires.

    return (
      <TimeSeries
        cellID={id}
        submitToken={submitToken}
        queries={this.queries}
        key={manualRefresh}
      >
        {({giraffeResult, loading, errorMessage, isInitialFetch}) => (
          <React.Fragment>
            <CellEvent id={id} type={properties.type} />
            <View
              loading={loading}
              error={errorMessage}
              isInitial={isInitialFetch}
              properties={properties}
              result={giraffeResult}
              timeRange={ranges}
              annotations={annotations}
              cellID={id}
              transmitWindowPeriod={transmitWindowPeriod}
            />
          </React.Fragment>
        )}
      </TimeSeries>
    )
  }

  private get queries(): DashboardQuery[] {
    const {properties} = this.props

    switch (properties.type) {
      case 'single-stat':
      case 'gauge':
        return [properties.queries[0]]
      default:
        return properties.queries
    }
  }
}

const mstp = (state: AppState, ownProps: OwnProps) => {
  const timeRange = getTimeRangeWithTimezone(state)
  const ranges = getActiveTimeRange(timeRange, ownProps.properties.queries)
  const annotations = getAnnotations(state)

  return {ranges, timeRange, annotations}
}

export default connect<StateProps, {}, OwnProps>(mstp)(RefreshingView)

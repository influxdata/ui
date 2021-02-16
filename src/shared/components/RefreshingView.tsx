// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect} from 'react-redux'

// Components
import TimeSeries from 'src/shared/components/TimeSeries'
import {View} from 'src/visualization'

// Utils
import {GlobalAutoRefresher} from 'src/utils/AutoRefresher'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'
import {getActiveTimeRange} from 'src/timeMachine/selectors/index'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
  manualRefresh: number
  properties: QueryViewProperties
}

interface StateProps {
  annotations: AnnotationsList
  timeRange: TimeRange
  ranges: TimeRange | null
}

interface State {
  submitToken: number
}

type Props = OwnProps & StateProps & RouteComponentProps<{orgID: string}>

class RefreshingView extends PureComponent<Props, State> {
  public static defaultProps = {
    inView: true,
    manualRefresh: 0,
  }

  constructor(props) {
    super(props)

    this.state = {submitToken: 0}
  }

  public componentDidMount() {
    GlobalAutoRefresher.subscribe(this.incrementSubmitToken)
  }

  public componentWillUnmount() {
    GlobalAutoRefresher.unsubscribe(this.incrementSubmitToken)
  }

  public render() {
    const {id, ranges, properties, manualRefresh, annotations} = this.props
    const {submitToken} = this.state

    return (
      <TimeSeries
        cellID={id}
        submitToken={submitToken}
        queries={this.queries}
        key={manualRefresh}
      >
        {({giraffeResult, loading, errorMessage, isInitialFetch}) => (
          <View
            loading={loading}
            error={errorMessage}
            isInitial={isInitialFetch}
            properties={properties}
            result={giraffeResult}
            timeRange={ranges}
            annotations={annotations}
          />
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

  private incrementSubmitToken = () => {
    this.setState({submitToken: Date.now()})
  }
}

const mstp = (state: AppState, ownProps: OwnProps) => {
  const timeRange = getTimeRangeWithTimezone(state)
  const ranges = getActiveTimeRange(timeRange, ownProps.properties.queries)

  const annotations = state.annotations.annotations
  //console.log('got annotations???? jill42a ', annotations)

  const defaultObject = {ranges, timeRange}

  if (isFlagEnabled('annotations')) {
    return {
      annotations,
      ...defaultObject,
    }
  } else {
    return defaultObject
  }
}

export default connect<StateProps, {}, OwnProps>(mstp)(
  withRouter(RefreshingView)
)

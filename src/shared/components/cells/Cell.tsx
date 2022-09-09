// Libraries
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {get} from 'lodash'

// Components
import CellHeader from 'src/shared/components/cells/CellHeader'
import CellContext from 'src/shared/components/cells/CellContext'
import ScrollableMarkdown from 'src/shared/components/views/ScrollableMarkdown'
import RefreshingView from 'src/shared/components/RefreshingView'
import {ErrorHandling} from 'src/shared/decorators/errors'
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {getByID} from 'src/resources/selectors'
import {resetQueryCacheByQuery} from 'src/shared/apis/queryCache'
import {event, normalizeEventName} from 'src/cloud/utils/reporting'
import {chartTypeName} from 'src/visualization/utils/chartTypeName'

// Types
import {
  RemoteDataState,
  AppState,
  View,
  Cell,
  ResourceType,
  Variable,
} from 'src/types'

// Selectors
import {getAllVariables} from 'src/variables/selectors'
import {getWindowPeriodFromQueryBuilder} from 'src/timeMachine/selectors'

// Constants
import {FALLBACK_WINDOW_PERIOD} from 'src/variables/utils/getWindowVars'
import {AGG_WINDOW_AUTO} from 'src/timeMachine/constants/queryBuilder'

interface StateProps {
  variables: Variable[]
  view: View
  windowPeriodFromQueryBuilder: string
}

interface OwnProps {
  cell: Cell
  manualRefresh: number
}

interface State {
  submitToken: number
  isPaused: boolean
  windowPeriod: string
}

type Props = StateProps & OwnProps

@ErrorHandling
class CellComponent extends Component<Props, State> {
  state = {
    submitToken: 0,
    isPaused: false,
    windowPeriod: `${FALLBACK_WINDOW_PERIOD}ms`,
  }

  public componentDidMount() {
    const {view} = this.props
    if (view) {
      event(`dashboard.cell.view`, {
        type: normalizeEventName(chartTypeName(view?.properties?.type)),
      })
    }

    if (this.props.windowPeriodFromQueryBuilder !== AGG_WINDOW_AUTO) {
      this.setState({
        ...this.state,
        windowPeriod: this.props.windowPeriodFromQueryBuilder,
      })
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    if (
      this.props.windowPeriodFromQueryBuilder !== AGG_WINDOW_AUTO &&
      prevProps.windowPeriodFromQueryBuilder !==
        this.props.windowPeriodFromQueryBuilder
    ) {
      this.setState({
        ...prevState,
        windowPeriod: this.props.windowPeriodFromQueryBuilder,
      })
    }
  }

  private handleRefreshProcess = (): void => {
    const {view, variables} = this.props
    if (view.properties?.type === 'markdown') {
      return
    }
    view.properties?.queries?.forEach(query => {
      resetQueryCacheByQuery(query.text, variables)
    })
  }

  private handleIncrementToken = (): void => {
    if (this.state.isPaused) {
      return
    }
    this.handleRefreshProcess()
    this.setState(s => ({...s, submitToken: s.submitToken + 1}))
  }

  private handlePauseCell = (): void => {
    event('dashboards.autorefresh.cell.pause', {
      paused: this.state.isPaused.toString(),
    })
    this.setState(prevState => ({
      ...prevState,
      isPaused: !this.state.isPaused,
    }))
  }

  private handleWindowPeriod = (windowPeriod: number) => {
    this.setState(prevState => ({
      ...prevState,
      windowPeriod: `${windowPeriod}ms`,
    }))
  }

  public render() {
    const {cell, view} = this.props

    return (
      <>
        <CellHeader name={this.viewName} note={this.viewNote}>
          <span>window period: {this.windowPeriod}</span>
          <CellContext
            cell={cell}
            view={view}
            onRefresh={this.handleIncrementToken}
            isPaused={this.state.isPaused}
            togglePauseCell={this.handlePauseCell}
          />
        </CellHeader>
        <div
          className="cell--view"
          data-testid={`cell--view-empty ${view?.properties?.type}`}
        >
          {this.view}
        </div>
      </>
    )
  }

  private get viewName(): string {
    const {view} = this.props

    if (view && view.properties && view.properties.type !== 'markdown') {
      return view.name
    }

    return 'Note'
  }

  private get viewNote(): string {
    const {view} = this.props

    if (!view?.properties?.type) {
      return ''
    }

    const isMarkdownView = view.properties.type === 'markdown'
    const showNoteWhenEmpty = get(view, 'properties.showNoteWhenEmpty')

    if (isMarkdownView || showNoteWhenEmpty) {
      return ''
    }

    return get(view, 'properties.note', '')
  }

  private get view(): JSX.Element {
    const {manualRefresh, view} = this.props

    if (!view || view.status !== RemoteDataState.Done) {
      return <EmptyGraphMessage message="Loading..." />
    }

    if (!view.properties) {
      return null
    }

    if (view.properties.type === 'markdown') {
      return <ScrollableMarkdown text={view.properties.note} />
    }

    return (
      <RefreshingView
        id={view.id}
        properties={view.properties}
        manualRefresh={manualRefresh}
        incrementSubmitToken={this.handleIncrementToken}
        submitToken={this.state.submitToken}
        transmitWindowPeriod={this.handleWindowPeriod}
      />
    )
  }

  private get windowPeriod(): string {
    return this.props.windowPeriodFromQueryBuilder === AGG_WINDOW_AUTO
      ? `${this.state.windowPeriod}`
      : this.props.windowPeriodFromQueryBuilder
  }
}

const mstp = (state: AppState, ownProps: OwnProps) => {
  const view = getByID<View>(state, ResourceType.Views, ownProps.cell.id)
  const windowPeriodFromQueryBuilder = getWindowPeriodFromQueryBuilder(
    state,
    view?.id
  )
  const variables = getAllVariables(state)
  return {variables, view, windowPeriodFromQueryBuilder}
}

export default connect<StateProps, {}, OwnProps>(mstp)(CellComponent)

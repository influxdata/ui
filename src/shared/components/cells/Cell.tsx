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
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
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
import {getAllVariables} from 'src/variables/selectors'

interface StateProps {
  view: View
  variables: Variable[]
}

interface OwnProps {
  cell: Cell
  manualRefresh: number
}

interface State {
  submitToken: number
  isPaused: boolean
}

type Props = StateProps & OwnProps

@ErrorHandling
class CellComponent extends Component<Props, State> {
  state = {
    submitToken: 0,
    isPaused: false,
  }

  public componentDidMount() {
    const {view} = this.props
    if (view) {
      event(`dashboard.cell.view`, {
        type: normalizeEventName(chartTypeName(view?.properties?.type)),
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

  public render() {
    const {cell, view} = this.props

    return (
      <>
        <CellHeader name={this.viewName} note={this.viewNote}>
          <CellContext
            cell={cell}
            view={view}
            onRefresh={this.handleIncrementToken}
            isPaused={this.state.isPaused}
            togglePauseCell={this.handlePauseCell}
          />
        </CellHeader>
        <ErrorBoundary>
          <div
            className="cell--view"
            data-testid={`cell--view-empty ${view?.properties?.type}`}
          >
            {this.view}
          </div>
        </ErrorBoundary>
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
      />
    )
  }
}

const mstp = (state: AppState, ownProps: OwnProps) => {
  const view = getByID<View>(state, ResourceType.Views, ownProps.cell.id)
  const variables = getAllVariables(state)
  return {view, variables}
}

export default connect<StateProps, {}, OwnProps>(mstp)(CellComponent)

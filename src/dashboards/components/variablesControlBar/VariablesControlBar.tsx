// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {isEmpty} from 'lodash'

// Components
import {
  EmptyState,
  TechnoSpinner,
  SpinnerContainer,
} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import Toolbar from 'src/shared/components/toolbar/Toolbar'

// Utils
import {
  getVariables,
  getDashboardVariablesStatus,
} from 'src/variables/selectors'
import {filterUnusedVars} from 'src/shared/utils/filterUnusedVars'

// Actions
import {moveVariable} from 'src/variables/actions/thunks'

// Types
import {AppState} from 'src/types'
import {ComponentSize} from '@influxdata/clockface'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import {RemoteDataState} from 'src/types'
import DraggableDropdown from 'src/dashboards/components/variablesControlBar/DraggableDropdown'
import withDragDropContext from 'src/shared/decorators/withDragDropContext'

interface State {
  initialLoading: RemoteDataState
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

@ErrorHandling
class VariablesControlBar extends PureComponent<Props, State> {
  public state: State = {initialLoading: RemoteDataState.Loading}

  static getDerivedStateFromProps(props: Props, state: State) {
    if (
      props.variablesStatus === RemoteDataState.Done &&
      state.initialLoading !== RemoteDataState.Done
    ) {
      return {initialLoading: RemoteDataState.Done}
    }

    return {}
  }

  render() {
    const {show} = this.props
    if (!show) {
      return false
    }
    return (
      <Toolbar testID="variables-control-bar" className="variables-control-bar">
        <SpinnerContainer
          loading={this.state.initialLoading}
          spinnerComponent={<TechnoSpinner diameterPixels={50} />}
          className="variables-spinner-container"
        >
          {this.bar}
        </SpinnerContainer>
      </Toolbar>
    )
  }

  private get emptyBar(): JSX.Element {
    return (
      <EmptyState size={ComponentSize.ExtraSmall}>
        <EmptyState.Text className="margin-zero">
          This dashboard doesn't have any cells with defined variables.{' '}
          <a
            href="https://v2.docs.influxdata.com/v2.0/visualize-data/variables/"
            target="_blank"
          >
            Learn How
          </a>
        </EmptyState.Text>
      </EmptyState>
    )
  }

  private get barContents(): JSX.Element {
    const {variables, variablesStatus} = this.props
    return (
      <div className="variables-control-bar--grid">
        {variables.map((v, i) => (
          <ErrorBoundary key={v.id}>
            <DraggableDropdown
              name={v.name}
              id={v.id}
              index={i}
              moveDropdown={this.handleMoveDropdown}
            />
          </ErrorBoundary>
        ))}
        {variablesStatus === RemoteDataState.Loading && (
          <TechnoSpinner diameterPixels={18} />
        )}
      </div>
    )
  }

  private get bar(): JSX.Element {
    const {variables} = this.props

    if (isEmpty(variables)) {
      return this.emptyBar
    }

    return this.barContents
  }

  private handleMoveDropdown = (
    originalIndex: number,
    newIndex: number
  ): void => {
    const {moveVariable} = this.props
    moveVariable(originalIndex, newIndex)
  }
}

const mdtp = {
  moveVariable,
}

const mstp = (state: AppState) => {
  const dashboardID = state.currentDashboard.id
  const variables = getVariables(state)
  const variablesStatus = getDashboardVariablesStatus(state)
  const show = state.userSettings.showVariablesControls

  const varsInUse = filterUnusedVars(
    variables,
    Object.values(state.resources.views.byID).filter(
      variable => variable.dashboardID === dashboardID
    )
  )

  return {
    variables: varsInUse,
    variablesStatus,
    show,
  }
}

const connector = connect(mstp, mdtp)

export default withDragDropContext(connector(VariablesControlBar))

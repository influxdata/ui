// Libraries
import React, {FC, useRef, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

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
  getDashboardVariablesStatus,
  getControlBarVisibility,
  getVariablesForDashboard,
} from 'src/variables/selectors'

// Actions
import {moveVariable} from 'src/variables/actions/thunks'

// Types
import {ComponentSize} from '@influxdata/clockface'

// Decorators
import {RemoteDataState} from 'src/types'
import DraggableDropdown from 'src/dashboards/components/variablesControlBar/DraggableDropdown'
import withDragDropContext from 'src/shared/decorators/withDragDropContext'

const VariablesControlBar: FC = () => {
  const initialLoadingState = useRef<RemoteDataState>(RemoteDataState.Loading)
  const dispatch = useDispatch()
  const variables = useSelector(getVariablesForDashboard)
  const variablesStatus = useSelector(getDashboardVariablesStatus)
  const isVisible = useSelector(getControlBarVisibility)

  useEffect(() => {
    if (
      variablesStatus === RemoteDataState.Done &&
      initialLoadingState.current === RemoteDataState.Loading
    ) {
      initialLoadingState.current = RemoteDataState.Done
    }
  }, [variablesStatus])

  if (!isVisible) {
    return null
  }

  const handleMoveDropdown = (
    originalIndex: number,
    newIndex: number
  ): void => {
    dispatch(moveVariable(originalIndex, newIndex))
  }

  let toolbarContents = (
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

  if (variables.length) {
    toolbarContents = (
      <div className="variables-control-bar--grid">
        {variables.map((v, i) => (
          <ErrorBoundary key={v.id}>
            <DraggableDropdown
              name={v.name}
              id={v.id}
              index={i}
              moveDropdown={handleMoveDropdown}
            />
          </ErrorBoundary>
        ))}
        {variablesStatus === RemoteDataState.Loading && (
          <TechnoSpinner diameterPixels={18} />
        )}
      </div>
    )
  }

  return (
    <Toolbar testID="variables-control-bar" className="variables-control-bar">
      <SpinnerContainer
        loading={initialLoadingState.current}
        spinnerComponent={<TechnoSpinner diameterPixels={50} />}
        className="variables-spinner-container"
      >
        {toolbarContents}
      </SpinnerContainer>
    </Toolbar>
  )
}

export default withDragDropContext(VariablesControlBar)

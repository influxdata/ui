// Libraries
import React, {FC, useRef, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  EmptyState,
  TechnoSpinner,
  SpinnerContainer,
} from '@influxdata/clockface'
import Toolbar from 'src/shared/components/toolbar/Toolbar'

// Utils
import {
  getDashboardVariablesStatus,
  getControlBarVisibility,
  getVariablesForDashboard,
} from 'src/variables/selectors'

// Types
import {ComponentSize} from '@influxdata/clockface'

// Decorators
import {RemoteDataState} from 'src/types'
import VariablesControlBarList from 'src/dashboards/components/variablesControlBar/VariablesControlBarList'

const VariablesControlBar: FC = () => {
  const initialLoadingState = useRef<RemoteDataState>(RemoteDataState.Loading)
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
    toolbarContents = <VariablesControlBarList variables={variables} />
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

export default VariablesControlBar

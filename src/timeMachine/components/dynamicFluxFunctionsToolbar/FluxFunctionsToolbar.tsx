// Libraries
import React, {FC, useMemo, useState, useCallback, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import TransformToolbarFunctions from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TransformToolbarFunctions'
import FluxToolbarSearch from 'src/timeMachine/components/FluxToolbarSearch'
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import ToolbarFunction from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/ToolbarFunction'

import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

import {Fluxdocs} from 'src/client/fluxdocsdRoutes'
import {getFluxPackages} from 'src/timeMachine/actions/scriptEditorThunks'

// Types
import {RemoteDataState} from 'src/types'
import {AppState} from 'src/types'

interface OwnProps {
  onInsertFluxFunction: (func) => void
}

interface DispatchProps {
  getFluxPackages: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps & DispatchProps

const DynamicFluxFunctionsToolbar: FC<Props> = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [fluxServiceError, setFluxServiceError] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const handleSearch = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  useEffect(() => {
    const getFluxFuncs = async () => {
      try {
        setFluxServiceError(RemoteDataState.Loading)

        if (props.fluxFunctions.length === 0) {
          await props.getFluxPackages()
          setFluxServiceError(RemoteDataState.Done)
        }
        setFluxServiceError(RemoteDataState.Done)
      } catch (err) {
        console.error(err)
        setFluxServiceError(RemoteDataState.Error)
      }
    }
    getFluxFuncs()
  }, [])

  const handleClickFunction = useCallback(
    (func: Fluxdocs) => {
      props.onInsertFluxFunction(func)
    },
    [props.onInsertFluxFunction]
  )

  return useMemo(() => {
    return (
      <SpinnerContainer
        loading={fluxServiceError}
        spinnerComponent={<TechnoSpinner />}
      >
        <ErrorBoundary>
          <FluxToolbarSearch onSearch={handleSearch} resourceName="Functions" />
          <DapperScrollbars className="flux-toolbar--scroll-area">
            <div
              className="flux-toolbar--list"
              data-testid="flux-toolbar--list"
            >
              <TransformToolbarFunctions
                funcs={props.fluxFunctions}
                searchTerm={searchTerm}
              >
                {sortedFunctions =>
                  sortedFunctions.map((func, index) => (
                    <ToolbarFunction
                      onClickFunction={handleClickFunction}
                      key={index}
                      func={func}
                      testID={func.name}
                    />
                  ))
                }
              </TransformToolbarFunctions>
            </div>
          </DapperScrollbars>
        </ErrorBoundary>
      </SpinnerContainer>
    )
  }, [searchTerm, handleClickFunction, fluxServiceError])
}

const mstp = (state: AppState) => {
  const fluxFunctions = state.fluxDocs.fluxDocs
  return {fluxFunctions}
}

const mdtp = {
  getFluxPackages,
}
const connector = connect(mstp, mdtp)

export default connector(DynamicFluxFunctionsToolbar)

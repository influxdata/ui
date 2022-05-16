// Libraries
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import FluxToolbarSearch from 'src/timeMachine/components/FluxToolbarSearch'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import TransformToolbarFunctions from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TransformToolbarFunctions'
import ToolbarFunction from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/ToolbarFunction'

// Actions
import {getFluxPackages} from 'src/shared/actions/fluxDocs'

// Types
import {AppState} from 'src/types'
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'
import {RemoteDataState} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'
interface OwnProps {
  onInsertFluxFunction: (func) => void
}
interface DispatchProps {
  getFluxPackages: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps & DispatchProps

const hoveredFunctions = new Set<string>()

const DynamicFluxFunctionsToolbar: FC<Props> = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [termRecorded, setTermRecorded] = useState('')
  const [tooltipPopup, setTooltipPopup] = useState(false)
  const [fluxLoadingState, setFluxLoadingState] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const [hoveredFunction, setHoverdFunction] = useState('')

  useEffect(() => {
    const getFluxFuncs = async () => {
      try {
        setFluxLoadingState(RemoteDataState.Loading)

        if (fluxFunctions.length === 0) {
          await getFluxPackages()
        }
        setFluxLoadingState(RemoteDataState.Done)
      } catch (err) {
        console.error(err)
        setFluxLoadingState(RemoteDataState.Error)
      }
    }
    getFluxFuncs()
    return () => {
      setFluxLoadingState(RemoteDataState.NotStarted)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tooltipPopup && searchTerm !== termRecorded) {
      hoveredFunctions.clear()
      event('flux.function.searched', {searchTerm: searchTerm})
      setTermRecorded(searchTerm)
    }
    setTooltipPopup(false)
    if (tooltipPopup) {
      const recordedFunction = hoveredFunctions.has(hoveredFunction)
      if (!recordedFunction) {
        event('flux.function.hover', {function: hoveredFunction})
      }
      hoveredFunctions.add(hoveredFunction)
    }
  }, [hoveredFunction, searchTerm, tooltipPopup])

  const {onInsertFluxFunction, fluxFunctions, getFluxPackages} = props

  const handleSearch = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  const handleClickFunction = useCallback(
    (func: Fluxdocs) => {
      onInsertFluxFunction(func)
    },
    [onInsertFluxFunction]
  )

  return useMemo(() => {
    return (
      <SpinnerContainer
        loading={fluxLoadingState}
        spinnerComponent={<TechnoSpinner />}
      >
        <ErrorBoundary>
          <FluxToolbarSearch
            onSearch={handleSearch}
            resourceName="by Package or Function"
          />
          <DapperScrollbars className="flux-toolbar--scroll-area">
            <div
              className="flux-toolbar--list"
              data-testid="flux-toolbar--list"
            >
              <TransformToolbarFunctions
                funcs={fluxFunctions}
                searchTerm={searchTerm}
              >
                {sortedFunctions =>
                  sortedFunctions.map((func, index) => (
                    <ToolbarFunction
                      onClickFunction={handleClickFunction}
                      key={index}
                      func={func}
                      testID={func.name}
                      setToolTipPopup={setTooltipPopup}
                      setHoverdFunction={setHoverdFunction}
                    />
                  ))
                }
              </TransformToolbarFunctions>
            </div>
          </DapperScrollbars>
        </ErrorBoundary>
      </SpinnerContainer>
    )
  }, [fluxFunctions, fluxLoadingState, handleClickFunction, searchTerm])
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

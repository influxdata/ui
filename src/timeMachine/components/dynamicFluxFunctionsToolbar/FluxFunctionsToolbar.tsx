// Libraries
import React, {FC, useMemo, useState, useCallback, useEffect} from 'react'

// Components
import TransformToolbarFunctions from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TransformToolbarFunctions'
import FluxToolbarSearch from 'src/timeMachine/components/FluxToolbarSearch'
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import ToolbarFunction from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/ToolbarFunction'

import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

import {getFluxdocs, Fluxdocs} from 'src/client/fluxdocsdRoutes'

// Types
import {RemoteDataState} from 'src/types'

interface OwnProps {
  onInsertFluxFunction: (func) => void
}

const DynamicFluxFunctionsToolbar: FC<OwnProps> = (props: OwnProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [fluxFuncs, setFluxFuncs] = useState([])
  const [fluxServiceError, setFluxServiceError] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const handleSearch = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  useEffect(() => {
    let isMounted = true
    const getFluxFuncs = async () => {
      try {
        setFluxServiceError(RemoteDataState.Loading)

        const resp = await getFluxdocs({})

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        if (isMounted) {
          // filter only functions not value
          const onlyFluxFuncs = resp.data.filter(
            value => value.kind === 'Function'
          )
          setFluxFuncs(onlyFluxFuncs)
          setFluxServiceError(RemoteDataState.Done)
        }
      } catch (err) {
        console.error(err)
        setFluxServiceError(RemoteDataState.Error)
      }
    }

    getFluxFuncs()
    return () => {
      isMounted = false
    }
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
                funcs={fluxFuncs}
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

export default DynamicFluxFunctionsToolbar

// Libraries
import React, {FC, useMemo, useState, useCallback, useEffect} from 'react'

// Components
import TransformToolbarFunctions from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TransformToolbarFunctions'
import FluxToolbarSearch from 'src/timeMachine/components/FluxToolbarSearch'
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import ToolbarFunction from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/ToolbarFunction'

// Constants
import {FLUX_FUNCTIONS} from 'src/shared/constants/fluxFunctions'

// Types
import {FluxToolbarFunction} from 'src/types'

interface OwnProps {
  onInsertFluxFunction: (func: FluxToolbarFunction) => void
}

const DynamicFluxFunctionsToolbar: FC<OwnProps> = (props: OwnProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [fluxFuncs, setFluxFuncs] = useState('')

  const handleSearch = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  useEffect(() => {
    const url = 'http://localhost:3000/fluxdocs'
    fetch(url).then(resp => resp.json())
    .then(resp => setFluxFuncs(resp))
  }, [])

  const handleClickFunction = useCallback(
    (func: FluxToolbarFunction) => {
      props.onInsertFluxFunction(func)
    },
    [props.onInsertFluxFunction]
  )

  return useMemo(() => {
    return (
      <ErrorBoundary>
        <FluxToolbarSearch onSearch={handleSearch} resourceName="Functions" />
        <DapperScrollbars className="flux-toolbar--scroll-area">
          <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
            <TransformToolbarFunctions
              funcs={fluxFuncs}
              searchTerm={searchTerm}
            >
              {sortedFunctions =>
                sortedFunctions.map(func => (
                  <ToolbarFunction
                    onClickFunction={handleClickFunction}
                    key={`${func.name}`}
                    func={func}
                    testID={func.name}
                  />
                ))
              }
            </TransformToolbarFunctions>
          </div>
        </DapperScrollbars>
      </ErrorBoundary>
    )
  }, [searchTerm, handleClickFunction])
}

export default DynamicFluxFunctionsToolbar

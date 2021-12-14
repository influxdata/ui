// Libraries
import React, {FC, useMemo, useState, useCallback} from 'react'

// Components
import TransformToolbarFunctions from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TransformToolbarFunctions'
import FunctionCategory from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/FunctionCategory'
import FluxToolbarSearch from 'src/timeMachine/components/FluxToolbarSearch'
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Constants
import {FLUX_FUNCTIONS} from 'src/shared/constants/fluxFunctions'

// Types
import {FluxToolbarFunction} from 'src/types'

interface OwnProps {
  onInsertFluxFunction: (func: FluxToolbarFunction) => void
}

const DynamicFluxFunctionsToolbar: FC<OwnProps> = (props: OwnProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

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
              funcs={FLUX_FUNCTIONS}
              searchTerm={searchTerm}
            >
              {sortedFunctions =>
                Object.entries(sortedFunctions).map(([category, funcs]) => (
                  <FunctionCategory
                    key={category}
                    category={category}
                    funcs={funcs}
                    onClickFunction={handleClickFunction}
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

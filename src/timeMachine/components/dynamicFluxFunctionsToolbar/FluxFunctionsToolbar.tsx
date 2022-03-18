// Libraries
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import FluxToolbarSearch from 'src/timeMachine/components/FluxToolbarSearch'
import TransformToolbarFunctions from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/TransformToolbarFunctions'
import ToolbarFunction from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/ToolbarFunction'

// Actions
import {getFluxDocs as getFluxPackages} from 'src/shared/actions/fluxDocs'
import {getAllFluxFunctions} from 'src/resources/selectors'

// Types
import {FluxFunction as Fluxdocs} from 'src/types'

interface Props {
  onInsertFluxFunction: (func) => void
}

const DynamicFluxFunctionsToolbar: FC<Props> = (props: Props) => {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const fluxFunctions: Fluxdocs[] = useSelector(getAllFluxFunctions)

  useEffect(() => {
    if (fluxFunctions.length === 0) {
      dispatch(getFluxPackages())
    }
  }, [])

  const {onInsertFluxFunction} = props

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
      <ErrorBoundary>
        <FluxToolbarSearch onSearch={handleSearch} resourceName="Functions" />
        <DapperScrollbars className="flux-toolbar--scroll-area">
          <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
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
                  />
                ))
              }
            </TransformToolbarFunctions>
          </div>
        </DapperScrollbars>
      </ErrorBoundary>
    )
  }, [fluxFunctions, handleClickFunction, searchTerm])
}

export default DynamicFluxFunctionsToolbar

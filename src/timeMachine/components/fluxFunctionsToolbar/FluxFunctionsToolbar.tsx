// Libraries
import React, {FC, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import TransformToolbarFunctions from 'src/timeMachine/components/fluxFunctionsToolbar/TransformToolbarFunctions'
import FunctionCategory from 'src/timeMachine/components/fluxFunctionsToolbar/FunctionCategory'
import FluxToolbarSearch from 'src/timeMachine/components/FluxToolbarSearch'
import {DapperScrollbars} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Actions
import {setActiveQueryText} from 'src/timeMachine/actions'

// Utils
import {getActiveQuery} from 'src/timeMachine/selectors'

// Constants
import {FLUX_FUNCTIONS} from 'src/shared/constants/fluxFunctions'

// Types
import {AppState, FluxToolbarFunction} from 'src/types'

interface OwnProps {
  onInsertFluxFunction: (func: FluxToolbarFunction) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const FluxFunctionsToolbar: FC<Props> = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (searchTerm: string): void => {
    setSearchTerm(searchTerm)
  }

  const handleClickFunction = (func: FluxToolbarFunction) => {
    props.onInsertFluxFunction(func)
  }

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
  }, [searchTerm])
}

const mstp = (state: AppState) => {
  const activeQueryText = getActiveQuery(state).text

  return {activeQueryText}
}

const mdtp = {
  onSetActiveQueryText: setActiveQueryText,
}

const connector = connect(mstp, mdtp)

export default connector(FluxFunctionsToolbar)

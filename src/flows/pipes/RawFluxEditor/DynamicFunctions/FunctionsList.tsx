// Libraries
import React, {FC, useState, useMemo, useCallback, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  EmptyState,
  ComponentSize,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import Fn from 'src/flows/pipes/RawFluxEditor/DynamicFunctions/FluxInjectionOption'
import FunctionTooltipContent from 'src/flows/pipes/RawFluxEditor/DynamicFunctions/FunctionToolTipContent'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

// Actions
import {getFluxPackages} from 'src/timeMachine/actions/scriptEditorThunks'

// Types
import {RemoteDataState} from 'src/types'
import {AppState} from 'src/types'
interface OwnProps {
  onSelect: (fn) => void
}
interface DispatchProps {
  getFluxPackages: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps & DispatchProps

const FunctionsList: FC<Props> = (props: Props) => {
  const [search, setSearch] = useState('')
  const updateSearch = useCallback(
    text => {
      setSearch(text)
    },
    [search, setSearch]
  )
  const [fluxLoadingState, setfluxLoadingState] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const {fluxFunctions, getFluxPackages} = props

  useEffect(() => {
    const getFluxFuncs = async () => {
      try {
        setfluxLoadingState(RemoteDataState.Loading)

        if (fluxFunctions.length === 0) {
          await getFluxPackages()
          setfluxLoadingState(RemoteDataState.Done)
        }
        setfluxLoadingState(RemoteDataState.Done)
      } catch (err) {
        console.error(err)
        setfluxLoadingState(RemoteDataState.Error)
      }
    }
    getFluxFuncs()
  }, [])

  const sortedFunctions = useMemo(
    () =>
      fluxFunctions.sort((a, b) => {
        if (a.package.toLowerCase() === b.package.toLowerCase()) {
          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
        } else {
          return a.package.toLowerCase() < b.package.toLowerCase() ? -1 : 1
        }
      }),
    [fluxFunctions]
  )

  const filteredFunctions = sortedFunctions.filter(fn => {
    return (
      !search.length ||
      fn.name.toLowerCase().includes(search.toLowerCase()) ||
      fn.package.toLowerCase().includes(search.toLowerCase())
    )
  })

  return useMemo(() => {
    let fnComponent

    if (filteredFunctions.length === 0) {
      fnComponent = (
        <EmptyState size={ComponentSize.ExtraSmall}>
          <EmptyState.Text>No functions match your search</EmptyState.Text>
        </EmptyState>
      )
    } else {
      fnComponent = filteredFunctions.map((fn, index) => (
          
            <Fn
              onClick={onselect}
              extractor={fn => `${fn.package}.${fn.name}`}
              key={index}
              option={fn}
              testID={fn.name}
              ToolTipContent={FunctionTooltipContent}
            />
          
      ))
    }

    return (
      <SpinnerContainer
        loading={fluxLoadingState}
        spinnerComponent={<TechnoSpinner />}
      >
        <div className="flux-toolbar">
          <div className="flux-toolbar--search">
            <SearchWidget
              placeholderText="Filter Functions..."
              onSearch={updateSearch}
              searchTerm={search}
              testID="flux-toolbar-search--input"
            />
          </div>
          <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
            {fnComponent}
          </div>
        </div>
      </SpinnerContainer>
    )
  }, [filteredFunctions, fluxLoadingState, onselect, search, updateSearch])
}

const mstp = (state: AppState) => {
  const fluxFunctions = state.fluxDocs.fluxDocs
  return {fluxFunctions}
}

const mdtp = {
  getFluxPackages,
}
const connector = connect(mstp, mdtp)

export default connector(FunctionsList)

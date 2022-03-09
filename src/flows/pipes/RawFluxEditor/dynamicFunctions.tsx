import React, {FC, useState, useMemo, useCallback, useEffect} from 'react'

import {EmptyState, ComponentSize} from '@influxdata/clockface'
import {FluxToolbarFunction} from 'src/types/shared'
import Fn from 'src/flows/pipes/RawFluxEditor/dynamicFunction'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import {getFluxdocs, Fluxdocs} from 'src/client/fluxdocsdRoutes'
// Types
import {RemoteDataState} from 'src/types'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

interface Props {
  onSelect: (fn: FluxToolbarFunction) => void
}

const DynamicFunctions: FC<Props> = ({onSelect}) => {
  const [search, setSearch] = useState('')
  const [fluxFuncs, setFluxFuncs] = useState([])
  const [fluxServiceError, setFluxServiceError] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const updateSearch = useCallback(
    text => {
      setSearch(text)
    },
    [search, setSearch]
  )
  
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

  const sortedFunctions = fluxFuncs.sort((a, b) => {
    if (a.package.toLowerCase() === b.package.toLowerCase) {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
    } else {
      return a.package.toLowerCase() < b.package.toLowerCase() ? -1 : 1
    }
  })

  const filteredFunctions = sortedFunctions.filter(func =>
    func.name.toLowerCase().includes(search.toLowerCase())
  )

  return useMemo(() => {
    let fnComponent

    if (!filteredFunctions.length) {
      fnComponent = (
        <EmptyState size={ComponentSize.ExtraSmall}>
          <EmptyState.Text>No functions match your search</EmptyState.Text>
        </EmptyState>
      )
    } else {
      fnComponent = filteredFunctions.map((fn, idx) => (
        <Fn onClickFunction={onSelect} key={idx} func={fn} testID={fn.name} />
      ))
    }

    return (
      <SpinnerContainer
        loading={fluxServiceError}
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
  }, [search, onSelect, fluxServiceError])
}

export default DynamicFunctions

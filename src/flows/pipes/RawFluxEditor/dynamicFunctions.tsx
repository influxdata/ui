import React, {FC, useState, useMemo, useCallback, useEffect} from 'react'

import {EmptyState, ComponentSize} from '@influxdata/clockface'
// import {FLUX_FUNCTIONS} from 'src/shared/constants/fluxFunctions'
import {FluxToolbarFunction} from 'src/types/shared'
import Fn from 'src/flows/pipes/RawFluxEditor/dynamicFunction'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

interface Props {
  onSelect: (fn: FluxToolbarFunction) => void
}

const DynamicFunctions: FC<Props> = ({onSelect}) => {
  const [search, setSearch] = useState('')
  const [fluxFuncs, setFluxFuncs] = useState([])
  const updateSearch = useCallback(
    text => {
      setSearch(text)
    },
    [search, setSearch]
  )
  useEffect(() => {
    const url = 'http://localhost:3000/fluxdocs'
    fetch(url).then(resp => resp.json())
    .then(resp => setFluxFuncs(resp))
    
  }, [])
  // console.log('funcs ', typeof(fluxFuncs))
  const sortedFunctions = fluxFuncs.sort((a, b) => (a.package > b.package) ? 1 : -1).sort((a,b) => (a.name > b.name) ? 1 : -1)
  const filteredFunctions = sortedFunctions.filter(func =>
    func.name.toLowerCase().includes(search.toLowerCase())
    )
    // console.log('filtered funcs ', filteredFunctions.length)

  return useMemo(() => {
    let fnComponent

    if (!filteredFunctions.length) {
      fnComponent = (
        <EmptyState size={ComponentSize.ExtraSmall}>
          <EmptyState.Text>No functions match your search</EmptyState.Text>
        </EmptyState>
      )
    } else {
      fnComponent = filteredFunctions.map(fn => (
        <Fn
          onClickFunction={onSelect}
          key={`${fn.name}_${fn.desc}`}
          func={fn}
          testID={fn.name}
        />
      ))
    }

    return (
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
    )
  }, [search, onSelect, fluxFuncs])
}

export default DynamicFunctions

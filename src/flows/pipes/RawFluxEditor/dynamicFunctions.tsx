import React, {FC, useState, useMemo, useCallback} from 'react'

import {EmptyState, ComponentSize} from '@influxdata/clockface'
import {FLUX_FUNCTIONS} from 'src/shared/constants/fluxFunctions'
import {FluxToolbarFunction} from 'src/types/shared'
import Fn from 'src/flows/pipes/RawFluxEditor/FluxInjectionOption'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import FunctionTooltipContent from 'src/flows/pipes/RawFluxEditor/FunctionToolTipContent'

interface Props {
  onSelect: (fn: FluxToolbarFunction) => void
}

const DynamicFunctions: FC<Props> = ({onSelect}) => {
  const [search, setSearch] = useState('')
  const updateSearch = useCallback(
    text => {
      setSearch(text)
    },
    [search, setSearch]
  )

  const filteredFunctions = FLUX_FUNCTIONS.filter(func =>
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
      fnComponent = filteredFunctions.map(fn => (
        <Fn
          onClick={onSelect}
          key={`${fn.name}_${fn.desc}`}
          option={fn}
          testID={fn.name}
          ToolTipContent={FunctionTooltipContent}
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
  }, [search, onSelect, filteredFunctions, updateSearch])
}

export default DynamicFunctions

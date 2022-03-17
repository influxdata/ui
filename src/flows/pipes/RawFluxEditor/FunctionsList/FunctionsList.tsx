import React, {FC} from 'react'

import {FLUX_FUNCTIONS} from 'src/shared/constants/fluxFunctions'
import {FluxToolbarFunction} from 'src/types/shared'
import Fn from 'src/flows/shared/FilterList/InjectionOption'
import FilterList from 'src/flows/shared/FilterList/FilterList'
import FunctionTooltipContent from 'src/flows/pipes/RawFluxEditor/FunctionsList/per-function/FunctionToolTipContent'

interface Props {
  onSelect: (fn: FluxToolbarFunction) => void
}

const FunctionsList: FC<Props> = ({onSelect}) => {
  const render = fn => (
    <Fn
      onClick={onSelect}
      extractor={fn => (fn as FluxToolbarFunction).name}
      key={`${fn.name}_${fn.desc}`}
      option={fn}
      testID={fn.name}
      ToolTipContent={FunctionTooltipContent}
    />
  )

  return (
    <FilterList
      placeholder="Filter Functions..."
      emptyMessage="No functions match your search"
      extractor={fn => (fn as FluxToolbarFunction).name}
      items={FLUX_FUNCTIONS}
      renderItem={render}
    />
  )
}

export default FunctionsList

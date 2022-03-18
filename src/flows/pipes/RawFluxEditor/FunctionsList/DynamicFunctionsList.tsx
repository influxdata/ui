import React, {FC, useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {FluxFunction} from 'src/types/shared'
import Fn from 'src/flows/shared/FilterList/InjectionOption'
import FilterList from 'src/flows/shared/FilterList/FilterList'
import FluxDocsTooltipContent from 'src/flows/pipes/RawFluxEditor/FunctionsList/perFunction/FluxDocsTooltipContent'

// Actions
import {getFluxDocs as getFluxPackages} from 'src/shared/actions/fluxDocs'
import {getAllFluxFunctions} from 'src/resources/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

const sortFuncs = (a, b) => {
  if (a.package.toLowerCase() === b.package.toLowerCase()) {
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  } else {
    return a.package.toLowerCase() < b.package.toLowerCase() ? -1 : 1
  }
}

interface Props {
  onSelect: (fn: FluxFunction) => void
}

const DynamicFunctionsList: FC<Props> = ({onSelect}) => {
  const dispatch = useDispatch()
  const fluxFunctions: FluxFunction[] = useSelector(getAllFluxFunctions)

  useEffect(() => {
    if (fluxFunctions.length === 0) {
      dispatch(getFluxPackages())
    }
  }, [])

  const handleSelectItem = useCallback((func: FluxFunction) => {
    onSelect(func)
    event('Inject FluxDoc function into Flux Script')
  }, [])

  const render = fn => (
    <Fn
      onClick={handleSelectItem}
      extractor={fn => (fn as FluxFunction).name}
      key={`${fn.name}_${fn.desc}`}
      option={fn}
      testID={fn.name}
      ToolTipContent={FluxDocsTooltipContent}
    />
  )

  return (
    <FilterList
      placeholder="Filter Functions..."
      emptyMessage="No functions match your search"
      extractor={fn =>
        `${(fn as FluxFunction).name} ${(fn as FluxFunction).package}`
      }
      items={fluxFunctions.sort(sortFuncs)}
      renderItem={render}
    />
  )
}

export default DynamicFunctionsList

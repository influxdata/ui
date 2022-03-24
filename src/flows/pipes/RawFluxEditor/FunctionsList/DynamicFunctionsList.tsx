import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {FluxFunction} from 'src/types/shared'
import Fn from 'src/flows/shared/FilterList/InjectionOption'
import FilterList from 'src/flows/shared/FilterList/FilterList'
import FluxDocsTooltipContent from 'src/flows/pipes/RawFluxEditor/FunctionsList/perFunction/FluxDocsTooltipContent'

// Actions
import {getFluxPackages} from 'src/shared/actions/fluxDocs'
import {getAllFluxFunctions} from 'src/shared/selectors/app'

// Utils
import {event} from 'src/cloud/utils/reporting'
interface Props {
  onSelect: (fn: FluxFunction) => void
}

const sortFuncs = (a, b) => {
  if (a.package.toLowerCase() === b.package.toLowerCase()) {
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  } else {
    return a.package.toLowerCase() < b.package.toLowerCase() ? -1 : 1
  }
}

const DynamicFunctionsList: FC<Props> = ({onSelect}) => {
  const [eventSearchTerm, setEventSearchTerm] = useState('')
  const [termRecorded, setTermRecorded] = useState('')
  const [tooltipPopup, setTooltipPopup] = useState(false)
  const dispatch = useDispatch()
  const fluxFunctions = useSelector(getAllFluxFunctions)

  useEffect(() => {
    if (fluxFunctions.length === 0) {
      dispatch(getFluxPackages())
    }
  }, [])

  useEffect(() => {
    if (tooltipPopup && eventSearchTerm !== termRecorded) {
      event('flux.function.searched', {searchTerm: eventSearchTerm})
      setTermRecorded(eventSearchTerm)
    }
    setTooltipPopup(false)
  }, [eventSearchTerm, tooltipPopup])

  const handleSelectItem = useCallback(
    (func: FluxFunction) => {
      onSelect(func)
      event('flux.function.injected', {name: `${func.package}.${func.name}`})
      if (eventSearchTerm) {
        event('flux.function.searched', {searchTerm: eventSearchTerm})
      }
    },
    [eventSearchTerm]
  )

  const render = fn => (
    <Fn
      onClick={handleSelectItem}
      extractor={fn =>
        `${(fn as FluxFunction).package}.${(fn as FluxFunction).name}`
      }
      key={`${fn.name}_${fn.desc}`}
      option={fn}
      testID={fn.name}
      ToolTipContent={FluxDocsTooltipContent}
      searchTerm={eventSearchTerm}
      setToolTipPopup={setTooltipPopup}
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
      setEventSearchTerm={setEventSearchTerm}
    />
  )
}

export default DynamicFunctionsList

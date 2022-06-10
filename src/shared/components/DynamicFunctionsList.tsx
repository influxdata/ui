import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {FluxFunction} from 'src/types/shared'
import Fn from 'src/shared/components/FilterList/InjectionOption'
import FilterList from 'src/shared/components/FilterList/FilterList'
import FluxDocsTooltipContent from 'src/shared/components/FluxDocsTooltipContent'

// Actions
import {getFluxPackages} from 'src/shared/actions/fluxDocs'
import {getAllFluxFunctions} from 'src/shared/selectors/app'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getFluxExample} from 'src/shared/utils/fluxExample'
import {sortFuncs} from 'src/shared/utils/function'

interface Props {
  onSelect: (fn: FluxFunction) => void
}

const hoveredFunctions = new Set<string>()

const DynamicFunctionsList: FC<Props> = ({onSelect}) => {
  const [eventSearchTerm, setEventSearchTerm] = useState('')
  const [termRecorded, setTermRecorded] = useState('')
  const [tooltipPopup, setTooltipPopup] = useState(false)
  const [hoveredFunction, setHoverdFunction] = useState('')

  const dispatch = useDispatch()
  const fluxFunctions = useSelector(getAllFluxFunctions)

  useEffect(() => {
    if (fluxFunctions.length === 0) {
      dispatch(getFluxPackages())
    }
  }, [])

  useEffect(() => {
    if (tooltipPopup && eventSearchTerm !== termRecorded) {
      hoveredFunctions.clear()
      event('flux.function.searched', {searchTerm: eventSearchTerm})
      setTermRecorded(eventSearchTerm)
    }
    setTooltipPopup(false)
    if (tooltipPopup) {
      const recordedFunction = hoveredFunctions.has(hoveredFunction)
      if (!recordedFunction) {
        event('flux.function.hover', {function: hoveredFunction})
      }
      hoveredFunctions.add(hoveredFunction)
    }
  }, [hoveredFunction, tooltipPopup, eventSearchTerm])

  const handleSelectItem = useCallback((func: FluxFunction) => {
    onSelect(getFluxExample(func))
    event('flux.function.injected', {name: `${func.package}.${func.name}`})
  }, [])

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
      setToolTipPopup={setTooltipPopup}
      setHoverdFunction={setHoverdFunction}
    />
  )

  return (
    <FilterList
      placeholder="Filter by Package or Function"
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

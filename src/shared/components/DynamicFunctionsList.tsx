import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {DapperScrollbars} from '@influxdata/clockface'

// Components
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import {FluxFunction} from 'src/types/shared'
import Fn from 'src/shared/components/FilterList/InjectionOption'
import {FilterList} from 'src/shared/components/FilterList/FilterList'
import FluxDocsTooltipContent from 'src/shared/components/functions/perFunction/FluxDocsTooltipContent'

// Actions
import {getFluxPackages} from 'src/shared/actions/fluxDocs'
import {getAllFluxFunctions} from 'src/shared/selectors/app'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getFluxExample} from 'src/shared/utils/fluxExample'
import {sortFuncs} from 'src/shared/utils/functions'
import {isFlagEnabled} from '../utils/featureFlag'

interface Props {
  onSelect: (fn: FluxFunction) => void
}

const hoveredFunctions = new Set<string>()

const DynamicFunctionsList: FC<Props> = ({onSelect}) => {
  const [eventSearchTerm, setEventSearchTerm] = useState('')
  const [termRecorded, setTermRecorded] = useState('')
  const [tooltipPopup, setTooltipPopup] = useState(false)
  const [hoveredFunction, setHoverdFunction] = useState('')
  const [search, onSearch] = useState<string>('')

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
  }, [eventSearchTerm])

  useEffect(() => {
    const recordedFunction = hoveredFunctions.has(hoveredFunction)
    if (!recordedFunction) {
      event('flux.function.hover', {function: hoveredFunction})
    }
    hoveredFunctions.add(hoveredFunction)
  }, [hoveredFunction])

  const handleSelectItem = useCallback(
    (func: FluxFunction) => {
      onSelect(getFluxExample(func))
    },
    [onSelect]
  )

  if (isFlagEnabled('showFnPath')) {
    const _search = search.toLocaleLowerCase()
    const filteredpaths = fluxFunctions
      .filter(fn =>
        `${fn.path} ${fn.package} ${fn.name}`
          .toLocaleLowerCase()
          .includes(_search)
      )
      .reduce((acc, curr) => {
        if (!acc[curr.path]) {
          acc[curr.path] = []
        }

        acc[curr.path].push(curr)
        return acc
      }, {})
    const filtereditems = Object.keys(filteredpaths)
      .sort((a, b) =>
        a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
      )
      .reduce((acc, curr) => {
        acc.push(
          <div className="flux-toolbar--path" key={`fn-head-${curr}`}>
            {curr}
          </div>
        )

        return acc.concat(
          filteredpaths[curr]
            .sort((a, b) =>
              `${a.package} ${a.name}`
                .toLocaleLowerCase()
                .localeCompare(`${b.package} ${b.name}`.toLocaleLowerCase())
            )
            .map(fn => (
              <Fn
                onClick={handleSelectItem}
                extractor={fn =>
                  `${(fn as FluxFunction).package}.${(fn as FluxFunction).name}`
                }
                key={`${fn.path}-${fn.package}-${fn.name}`}
                option={fn}
                testID={fn.name}
                ToolTipContent={FluxDocsTooltipContent}
                setToolTipPopup={setTooltipPopup}
                setHoverdFunction={setHoverdFunction}
              />
            ))
        )
      }, [])

    return (
      <div className="flux-toolbar">
        <div className="flux-toolbar--search">
          <SearchWidget
            placeholderText="Filter by Package or Function"
            onSearch={onSearch}
            searchTerm={search}
            testID="flux-toolbar-search--input"
          />
        </div>
        <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
          <DapperScrollbars>{filtereditems}</DapperScrollbars>
        </div>
      </div>
    )
  }

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

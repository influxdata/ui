import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import FilterList from 'src/shared/components/FilterList/FilterList'
import FluxDocsTooltipContent from 'src/shared/components/functions/perFunction/FluxDocsTooltipContent'
import Fn from 'src/shared/components/FilterList/MinimalistInjectOption'

// State
import {getFluxPackages} from 'src/shared/actions/fluxDocs'
import {getAllFluxFunctions} from 'src/shared/selectors/app'
import {InjectionType, InjectionContext} from 'src/shared/contexts/injection'

// Types
import {FluxFunction} from 'src/types/shared'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getFluxExample} from 'src/shared/utils/fluxExample'
import {sortFuncs} from 'src/shared/components/functions/utils'
import './FluxBrowser.scss'

const TOOLTIP = `The flux standard library contains several packages, \
functions, and variables which may be useful when constructing your flux query.`

const FluxBrowser: FC = () => {
  const {inject} = useContext(InjectionContext)

  const dispatch = useDispatch()
  const fluxFunctions = useSelector(getAllFluxFunctions)

  useEffect(() => {
    if (fluxFunctions.length === 0) {
      dispatch(getFluxPackages())
    }
  }, [])

  const handleSelectItem = useCallback(
    (func: FluxFunction) => {
      inject({
        type: InjectionType.Function,
        function: getFluxExample(func),
      })
      event('flux.function.injected', {name: `${func.package}.${func.name}`})
    },
    [inject]
  )

  const render = useCallback(
    fn => (
      <Fn
        onClick={handleSelectItem}
        extractor={fn =>
          `${(fn as FluxFunction).package}.${(fn as FluxFunction).name}`
        }
        key={`${fn.name}_${fn.desc}`}
        option={fn}
        testID={fn.name}
        ToolTipContent={FluxDocsTooltipContent}
      />
    ),
    [handleSelectItem]
  )

  return useMemo(
    () => (
      <div className="qx-builder-flux-browser">
        <SelectorTitle title="Flux library" info={TOOLTIP} />
        <FilterList
          placeholder="Search for package or function..."
          emptyMessage="No results matched your search"
          extractor={fn =>
            `${(fn as FluxFunction).name} ${(fn as FluxFunction).package}`
          }
          items={fluxFunctions.sort(sortFuncs)}
          renderItem={render}
        />
      </div>
    ),
    [render, fluxFunctions]
  )
}

export default FluxBrowser

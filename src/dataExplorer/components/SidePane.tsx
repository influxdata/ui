import React, {FC, useContext, useCallback} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {EditorContext} from 'src/shared/contexts/editor'
import Functions from 'src/shared/components/GroupedFunctionsList'
import DynamicFunctions from 'src/shared/components/DynamicFunctionsList'

import {FluxFunction, FluxToolbarFunction} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import './SidePane.scss'

const TOOLTIP = `The flux standard library contains several packages, \
functions, and variables which may be useful when constructing your flux query.`

const SidePane: FC = () => {
  const {injectFunction} = useContext(EditorContext)

  const inject = useCallback(
    (fn: FluxFunction | FluxToolbarFunction) => {
      injectFunction(fn, () => {})

      event('flux function injected', {
        name: `${fn.package}.${fn.name}`,
        context: 'flux query builder',
      })
    },
    [injectFunction]
  )

  let browser = <Functions onSelect={inject} />

  if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
    browser = <DynamicFunctions onSelect={inject} />
  }

  return (
    <div className="container-right-side-bar">
      <SelectorTitle title="Flux library" info={TOOLTIP} />
      {browser}
    </div>
  )
}

export default SidePane

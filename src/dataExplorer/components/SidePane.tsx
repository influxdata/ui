import React, {FC, useCallback, useContext} from 'react'

// Context
import {InjectionType, InjectionContext} from 'src/shared/contexts/injection'

// Components
import Functions from 'src/shared/components/GroupedFunctionsList'
import DynamicFunctions from 'src/shared/components/DynamicFunctionsList'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {FluxFunction, FluxToolbarFunction} from 'src/types'

import './SidePane.scss'

const SidePane: FC = () => {
  const {inject} = useContext(InjectionContext)
  const injectFunction = useCallback(
    (fn: FluxFunction | FluxToolbarFunction): void => {
      inject({
        type: InjectionType.Function,
        function: fn,
      })
      event('flux function injected', {
        name: `${fn.package}.${fn.name}`,
        context: 'flux query builder',
      })
    },
    [inject]
  )

  let browser = <Functions onSelect={injectFunction} />

  if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
    browser = <DynamicFunctions onSelect={injectFunction} />
  }

  return <div className="container-right-side-bar">{browser}</div>
}

export default SidePane

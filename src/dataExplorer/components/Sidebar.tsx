import React, {FC, useContext, useCallback} from 'react'
import {DapperScrollbars} from '@influxdata/clockface'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import Functions from 'src/shared/components/GroupedFunctionsList'
import DynamicFunctions from 'src/shared/components/DynamicFunctionsList'

// Contexts
import {SidebarContext} from 'src/dataExplorer/context/sidebar'
import {EditorContext} from 'src/shared/contexts/editor'

// Types
import {FluxFunction, FluxToolbarFunction} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'

import './Sidebar.scss'

const TOOLTIP = `The flux standard library contains several packages, \
functions, and variables which may be useful when constructing your flux query.`

const Sidebar: FC = () => {
  const {injectFunction} = useContext(EditorContext)
  const {visible, menu, clear} = useContext(SidebarContext)

  const inject = useCallback(
    (fn: FluxFunction | FluxToolbarFunction) => {
      injectFunction(fn, () => {})

      event('flux.function.injected', {
        name: `${fn.package}.${fn.name}`,
        context: 'flux query builder',
      })
    },
    [injectFunction]
  )

  let browser = <Functions onSelect={inject} />

  if (CLOUD) {
    browser = <DynamicFunctions onSelect={inject} />
  }

  if (!visible && !menu) {
    return null
  }

  if (menu) {
    return (
      <div className="container-right-side-bar">
        <div className="flux-builder-sidebar--buttons">
          <button
            className="cf-overlay--dismiss"
            type="button"
            onClick={() => {
              clear()
            }}
          />
        </div>
        <div className="flux-builder-sidebar--menu">
          <DapperScrollbars
            noScrollX={true}
            thumbStopColor="gray"
            thumbStartColor="gray"
          >
            <div className="flux-builder-sidebar--menu-wrapper">{menu}</div>
          </DapperScrollbars>
        </div>
      </div>
    )
  }

  return (
    <div className="container-right-side-bar">
      <SelectorTitle label="Flux library" tooltipContents={TOOLTIP} />
      {browser}
    </div>
  )
}

export default Sidebar

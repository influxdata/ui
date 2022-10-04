import React, {FC, useContext, useCallback} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import Functions from 'src/shared/components/GroupedFunctionsList'
import DynamicFunctions from 'src/shared/components/DynamicFunctionsList'
import {ResultOptions} from 'src/dataExplorer/components/ResultOptions'
import {
  DapperScrollbars,
  FlexBox,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'

// Contexts
import {SidebarContext} from 'src/dataExplorer/context/sidebar'
import {EditorContext} from 'src/shared/contexts/editor'

// Types
import {FluxFunction, FluxToolbarFunction} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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

  const fluxLibrary = (
    <FlexBox.Child>
      <div className="container-flux-library">
        <SelectorTitle label="Flux library" tooltipContents={TOOLTIP} />
        {browser}
      </div>
    </FlexBox.Child>
  )

  const resultOptions = isFlagEnabled('resultOptions') ? (
    <FlexBox.Child>
      <ResultOptions />
    </FlexBox.Child>
  ) : null

  return (
    <FlexBox
      direction={FlexDirection.Column}
      justifyContent={JustifyContent.FlexStart}
      className="container-right-side-bar"
    >
      {resultOptions}
      {fluxLibrary}
    </FlexBox>
  )
}

export default Sidebar

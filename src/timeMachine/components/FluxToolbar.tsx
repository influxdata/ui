// Libraries
import React, {FC, useState, useContext} from 'react'

import {EditorContext} from 'src/shared/contexts/editor'

// Components
import Functions from 'src/shared/components/GroupedFunctionsList'
import DynamicFunctions from 'src/shared/components/DynamicFunctionsList'
import VariableToolbar from 'src/timeMachine/components/variableToolbar/VariableToolbar'
import FluxToolbarTab from 'src/timeMachine/components/FluxToolbarTab'

// Types
import {FluxFunction, FluxToolbarFunction} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'

type FluxToolbarTabs = 'functions' | 'variables' | 'none'

const FluxToolbar: FC = () => {
  const {injectFunction, injectVariable} = useContext(EditorContext)
  const [activeTab, setActiveTab] = useState<FluxToolbarTabs>('functions')

  const handleTabClick = (id: FluxToolbarTabs): void => {
    setActiveTab(id)
  }

  let activeToolbar

  const onInsertFluxFunction = (fn: FluxFunction | FluxToolbarFunction) => {
    injectFunction(fn, () => {})

    event('flux.function.injected', {
      name: `${fn.package}.${fn.name}`,
      context: 'time machine',
    })
  }

  const onInsertVariable = (name: string) => {
    injectVariable(name, () => {})

    event('variable injected', {context: 'time machine'})
  }

  if (activeTab === 'functions') {
    if (CLOUD) {
      activeToolbar = <DynamicFunctions onSelect={onInsertFluxFunction} />
    } else {
      activeToolbar = <Functions onSelect={onInsertFluxFunction} />
    }
  }

  if (activeTab === 'variables') {
    activeToolbar = <VariableToolbar onClickVariable={onInsertVariable} />
  }

  const toolbarExpanded = activeTab === 'functions' || activeTab === 'variables'

  return (
    <div className="flux-toolbar">
      {toolbarExpanded && (
        <div
          className="flux-toolbar--tab-contents"
          data-testid={`functions-toolbar-contents--${activeTab}`}
        >
          {activeToolbar}
        </div>
      )}
      <div className="flux-toolbar--tabs">
        <FluxToolbarTab
          id="functions"
          onClick={handleTabClick}
          name="Functions"
          active={activeTab === 'functions'}
          testID="functions-toolbar-tab"
        />
        <FluxToolbarTab
          id="variables"
          onClick={handleTabClick}
          name="Variables"
          active={activeTab === 'variables'}
        />
      </div>
    </div>
  )
}

export default FluxToolbar

// Libraries
import React, {FC, useState} from 'react'

// Components
import FluxFunctionsToolbar from 'src/timeMachine/components/fluxFunctionsToolbar/FluxFunctionsToolbar'
import DynamicFluxFunctionsToolbar from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/FluxFunctionsToolbar'
import VariableToolbar from 'src/timeMachine/components/variableToolbar/VariableToolbar'
import FluxToolbarTab from 'src/timeMachine/components/FluxToolbarTab'

// Types
import {FluxToolbarFunction} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface Props {
  onInsertFluxFunction: (func: FluxToolbarFunction) => void
  onInsertVariable: (variableName: string) => void
}

type FluxToolbarTabs = 'functions' | 'variables' | 'none'

const FluxToolbar: FC<Props> = ({onInsertFluxFunction, onInsertVariable}) => {
  const [activeTab, setActiveTab] = useState<FluxToolbarTabs>('functions')

  const handleTabClick = (id: FluxToolbarTabs): void => {
    setActiveTab(id)
  }

  let activeToolbar

  if (activeTab === 'functions') {
    if (isFlagEnabled('fluxDynamicDocs')) {
      activeToolbar = (
        <DynamicFluxFunctionsToolbar
          onInsertFluxFunction={onInsertFluxFunction}
        />
      )
    } else {
      activeToolbar = (
        <FluxFunctionsToolbar onInsertFluxFunction={onInsertFluxFunction} />
      )
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

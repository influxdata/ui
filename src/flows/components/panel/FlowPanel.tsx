// Libraries
import React, {FC, useContext} from 'react'
import classnames from 'classnames'
import {
  ComponentColor,
  IconFont,
  SquareButton,
} from '@influxdata/clockface'

// Components
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'
import FlowPanelTitle from 'src/flows/components/panel/FlowPanelTitle'
import Results from 'src/flows/components/panel/Results'
import {PIPE_DEFINITIONS} from 'src/flows'

// Types
import {PipeContextProps} from 'src/types/flows'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {Context as SidebarContext} from 'src/flows/context/sidebar'

export interface Props extends PipeContextProps {
  id: string
}

export interface HeaderProps {
  id: string
}

const FlowPanel: FC<Props> = ({id, children, controls}) => {
  const {flow} = useContext(FlowContext)
  const {id: focused, show, hide} = useContext(SidebarContext)

  const isVisible = flow.meta.get(id).visible

  const panelClassName = classnames('flow-panel', {
    [`flow-panel__visible`]: isVisible,
    [`flow-panel__hidden`]: !isVisible,
    'flow-panel__focus': focused === id,
  })

  const showResults =
    PIPE_DEFINITIONS[flow.data.get(id).type] &&
    ['inputs', 'transform'].includes(
      PIPE_DEFINITIONS[flow.data.get(id).type].family
    )

    const toggleSidebar = () => {
      if (id !== focused) {
        show(id, controls)
      } else {
        hide()
      }
    }

  const title = PIPE_DEFINITIONS[flow.data.get(id).type] ? (
    <FlowPanelTitle id={id} />
  ) : (
    <div className="flow-panel--editable-title">Error</div>
  )

  if (
    flow.readOnly &&
    !/^(visualization|markdown)$/.test(flow.data.get(id).type)
  ) {
    return null
  }

  return (
    <>
      <div className={panelClassName}>

    <div className="flow-panel--header">
      <div className="flow-panel--node-wrapper">
        <div className="flow-panel--node" />
      </div>
      {title}
      <SquareButton
        icon={IconFont.CogThick}
        onClick={toggleSidebar}
        color={id === focused ? ComponentColor.Secondary : ComponentColor.Default}
        titleText="Configure"
        className="flows-config-panel-button"
      />
    </div>
        {isVisible && <div className="flow-panel--body">{children}</div>}
        {showResults && (
          <div className="flow-panel--results">
            <Results />
          </div>
        )}
      </div>
      {!flow.readOnly && <InsertCellButton id={id} />}
    </>
  )
}

export default FlowPanel

import React, {FC, createElement, useMemo, useContext} from 'react'

import {PipeContextProps} from 'src/types/flows'
import Pipe from 'src/flows/components/Pipe'
import {PipeProvider} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'

interface FlowPipeProps {
  id: string
}
interface PanelProps extends PipeContextProps {
  id: string
}

const FlowPanel: FC<PanelProps> = ({id, children}) => {
  const {flow} = useContext(FlowContext)

  return (
    <div className="presentation-panel">
      <div className="cell--header">
        <div
          className="cell--draggable"
          data-testid={`cell--draggable ${name}`}
        >
          <div className="cell--dot-grid" />
          <div className="cell--dot-grid" />
          <div className="cell--dot-grid" />
        </div>
        <div className="cell--name">{flow.meta.byID[id].title}</div>
      </div>
      <div className="cell--body">{children}</div>
    </div>
  )
}

const FlowPipe: FC<FlowPipeProps> = ({id}) => {
  const panel: FC<PipeContextProps> = useMemo(
    () => props => {
      const _props = {
        ...props,
        id,
      }

      return createElement(FlowPanel, _props)
    },
    [id]
  )

  return (
    <PipeProvider id={id}>
      <Pipe Context={panel} />
    </PipeProvider>
  )
}

export default FlowPipe

import React, {FC, createElement, useMemo} from 'react'

import Pipe from 'src/flows/components/Pipe'
import FlowPanel from 'src/flows/components/panel/FlowPanel'
import {PipeProvider} from 'src/flows/context/pipe'
import {EditorProvider} from 'src/flows/context/editor'

export interface FlowPipeProps {
  id: string
}

const FlowPipe: FC<FlowPipeProps> = ({id}) => {
  return useMemo(
    () => (
      <PipeProvider id={id}>
        <EditorProvider id={id}>
          <Pipe
            Context={props => {
              const _props = {
                ...props,
                id,
              }
              return createElement(FlowPanel, _props)
            }}
          />
        </EditorProvider>
      </PipeProvider>
    ),
    [id]
  )
}

export default FlowPipe

import React, {FC, createElement, useMemo} from 'react'

import Pipe from 'src/flows/components/Pipe'
import FlowPanel from 'src/flows/components/panel/FlowPanel'
import {PipeProvider} from 'src/flows/context/pipe'
import {VariablesProvider} from 'src/flows/context/variables'

export interface FlowPipeProps {
  id: string
}

const FlowPipe: FC<FlowPipeProps> = ({id}) => {
  return useMemo(
    () => (
      <PipeProvider id={id}>
        <VariablesProvider>
          <Pipe
            Context={props => {
              const _props = {
                ...props,
                id,
              }
              return createElement(FlowPanel, _props)
            }}
          />
        </VariablesProvider>
      </PipeProvider>
    ),
    [id]
  )
}

export default FlowPipe

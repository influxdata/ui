import React, {FC, createElement, useMemo} from 'react'

import {PipeContextProps} from 'src/types/flows'
import Pipe from 'src/flows/components/Pipe'
import FlowPanel from 'src/flows/components/panel/FlowPanel'
import {PipeProvider} from 'src/flows/context/pipe'

export interface FlowPipeProps {
  id: string
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

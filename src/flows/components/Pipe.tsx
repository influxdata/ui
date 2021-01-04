import {FC, createElement, useContext} from 'react'

import {PIPE_DEFINITIONS} from 'src/flows'
import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'

const Pipe: FC<PipeProp> = props => {
  const {data} = useContext(PipeContext)

  if (!PIPE_DEFINITIONS.hasOwnProperty(data.type)) {
    return createElement(PIPE_DEFINITIONS['missing'].component, props)
  }

  return createElement(PIPE_DEFINITIONS[data.type].component, props)
}

export default Pipe

import {FC, createElement, useContext, useMemo} from 'react'

import {PIPE_DEFINITIONS} from 'src/flows'
import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'

const Pipe: FC<PipeProp> = props => {
  const {data} = useContext(PipeContext)

  return useMemo(() => {
    if (!PIPE_DEFINITIONS.hasOwnProperty(data.type)) {
      return createElement(PIPE_DEFINITIONS['missing'].component, props)
    }

    if (props.readOnly && PIPE_DEFINITIONS[data.type].readOnlyComponent) {
      return createElement(PIPE_DEFINITIONS[data.type].readOnlyComponent, props)
    }

    return createElement(PIPE_DEFINITIONS[data.type].component, props)
  }, [data.type, props.readOnly]) // eslint-disable-line react-hooks/exhaustive-deps
}

export default Pipe

// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'

// Components
import FlowPipe from 'src/flows/components/FlowPipe'
import EmptyPipeList from 'src/flows/components/EmptyPipeList'

const PipeList: FC = () => {
  const {flow} = useContext(FlowContext)
  const {data} = flow

  if (!data || !data.allIDs.length) {
    return <EmptyPipeList />
  }

  const _pipes = data.allIDs.map(id => {
    return <FlowPipe key={`pipe-${id}`} id={id} />
  })

  return <div className="flow">{_pipes}</div>
}

export default PipeList

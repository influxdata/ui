// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'

// Components
import FlowPipe from 'src/flows/components/FlowPipe'
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'

const PipeList: FC = () => {
  const {flow} = useContext(FlowContext)

  if (!flow.data || !flow.data.allIDs.length) {
    return <EmptyPipeList />
  }

  const _pipes = flow.data.allIDs.map(id => {
    return <FlowPipe key={`pipe-${id}`} id={id} />
  })

  return (
    <div className="flow">
      {!flow.readOnly && <InsertCellButton id={null} />}
      {_pipes}
    </div>
  )
}

export default PipeList

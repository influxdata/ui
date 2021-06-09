// Libraries
import React, {FC, useContext, useEffect} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'

// Components
import FlowPipe from 'src/flows/components/FlowPipe'
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import InsertCellButton from 'src/flows/components/panel/InsertCellButton'

const PipeList: FC = () => {
  const {flow} = useContext(FlowContext)
  const {queryAll} = useContext(FlowQueryContext)

  useEffect(() => {
    queryAll()
  }, [])

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

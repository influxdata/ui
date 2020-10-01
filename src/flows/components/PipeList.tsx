// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {ScrollContext} from 'src/flows/context/scroll'

// Components
import FlowPipe from 'src/flows/components/FlowPipe'
import EmptyPipeList from 'src/flows/components/EmptyPipeList'
import {DapperScrollbars} from '@influxdata/clockface'

const PipeList: FC = () => {
  const {scrollPosition} = useContext(ScrollContext)
  const {flow} = useContext(FlowContext)
  const {data} = flow

  if (!data || !data.allIDs.length) {
    return <EmptyPipeList />
  }

  const _pipes = data.allIDs.map(id => {
    return <FlowPipe key={`pipe-${id}`} id={id} />
  })

  return (
    <DapperScrollbars
      className="flow-main"
      autoHide={true}
      noScrollX={true}
      scrollTop={scrollPosition}
    >
      {_pipes}
    </DapperScrollbars>
  )
}

export default PipeList

// Libraries
import React, {FC, useContext} from 'react'

// Components
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {PipeContext} from 'src/flows/context/pipe'
import {PipeProp} from 'src/types/flows'

const MarkdownPanel: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)

  return (
    <Context>
      <div className="flow-panel--markdown markdown-format">
        <MarkdownRenderer text={data.text} />
      </div>
    </Context>
  )
}

export default MarkdownPanel

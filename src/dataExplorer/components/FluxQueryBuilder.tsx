import React, {FC, useState} from 'react'
import {DraggableResizer, Orientation} from '@influxdata/clockface'

// Components
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import Schema from 'src/dataExplorer/components/Schema'

// Styles
import './FluxQueryBuilder.scss'

const INITIAL_VERT_RESIZER_HANDLE = 0.2

const FluxQueryBuilder: FC = () => {
  const [vertDragPosition, setVertDragPosition] = useState([
    INITIAL_VERT_RESIZER_HANDLE,
  ])

  return (
    <DraggableResizer
      handleOrientation={Orientation.Vertical}
      handlePositions={vertDragPosition}
      onChangePositions={setVertDragPosition}
    >
      <DraggableResizer.Panel>
        <Schema />
      </DraggableResizer.Panel>
      <DraggableResizer.Panel className="new-data-explorer-rightside">
        <ResultsPane />
      </DraggableResizer.Panel>
    </DraggableResizer>
  )
}

export default FluxQueryBuilder

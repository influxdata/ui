import React, {FC, useState} from 'react'
import {DraggableResizer, Orientation} from '@influxdata/clockface'
import {QueryProvider} from 'src/shared/contexts/query'
import {ResultsProvider} from 'src/dataExplorer/components/ResultsContext'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'

import './NewDataExplorer.scss'

const INITIAL_VERT_RESIZER_HANDLE = 0.2

const NewDataExplorer: FC = () => {
  const [vertDragPosition, setVertDragPosition] = useState([
    INITIAL_VERT_RESIZER_HANDLE,
  ])

  return (
    <QueryProvider>
      <DraggableResizer
        handleOrientation={Orientation.Vertical}
        handlePositions={vertDragPosition}
        onChangePositions={setVertDragPosition}
      >
        <DraggableResizer.Panel>
          <h1>[ schema ]</h1>
        </DraggableResizer.Panel>
        <DraggableResizer.Panel className="new-data-explorer-rightside">
          <ResultsProvider>
            <ResultsPane />
          </ResultsProvider>
        </DraggableResizer.Panel>
      </DraggableResizer>
    </QueryProvider>
  )
}

export default NewDataExplorer

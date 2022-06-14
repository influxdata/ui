import React, {FC, useState} from 'react'

// Components
import {DraggableResizer, Orientation} from '@influxdata/clockface'
import {QueryProvider} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {ResultsProvider} from 'src/dataExplorer/components/ResultsContext'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import SidePane from 'src/dataExplorer/components/SidePane'
import Schema from 'src/dataExplorer/components/Schema'

// Styles
import './FluxQueryBuilder.scss'

const INITIAL_LEFT_VERT_RESIZER_HANDLE = 0.2
const INITIAL_RIGHT_VERT_RESIZER_HANDLE = 0.8

const FluxQueryBuilder: FC = () => {
  const [vertDragPosition, setVertDragPosition] = useState([
    INITIAL_LEFT_VERT_RESIZER_HANDLE,
    INITIAL_RIGHT_VERT_RESIZER_HANDLE,
  ])

  return (
    <QueryProvider>
      <EditorProvider>
        <DraggableResizer
          handleOrientation={Orientation.Vertical}
          handlePositions={vertDragPosition}
          onChangePositions={setVertDragPosition}
        >
          <DraggableResizer.Panel>
            <Schema />
          </DraggableResizer.Panel>
          <DraggableResizer.Panel
            testID="flux-query-builder-middle-panel"
            className="new-data-explorer-rightside"
          >
            <ResultsProvider>
              <ResultsPane />
            </ResultsProvider>
          </DraggableResizer.Panel>
          <DraggableResizer.Panel>
            <SidePane />
          </DraggableResizer.Panel>
        </DraggableResizer>
      </EditorProvider>
    </QueryProvider>
  )
}

export default FluxQueryBuilder

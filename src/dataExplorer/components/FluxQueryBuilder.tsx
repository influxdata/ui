import React, {FC, useState} from 'react'
import {DraggableResizer, Orientation} from '@influxdata/clockface'

// Components
import {InjectionProvider} from 'src/shared/contexts/injection'
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
    <InjectionProvider>
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
          <ResultsPane />
        </DraggableResizer.Panel>
        <DraggableResizer.Panel>
          <SidePane />
        </DraggableResizer.Panel>
      </DraggableResizer>
    </InjectionProvider>
  )
}

export default FluxQueryBuilder

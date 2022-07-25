import React, {FC} from 'react'

// Components
import {DraggableResizer, Orientation} from '@influxdata/clockface'
import {QueryProvider} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {ResultsProvider} from 'src/dataExplorer/components/ResultsContext'
import {SidebarProvider} from 'src/dataExplorer/context/sidebar'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import Sidebar from 'src/dataExplorer/components/Sidebar'
import Schema from 'src/dataExplorer/components/Schema'
import {useSessionStorage} from 'src/dataExplorer/shared/utils'

// Styles
import './FluxQueryBuilder.scss'

const FluxQueryBuilder: FC = () => {
  const [
    vertDragPosition,
    setVertDragPosition,
  ] = useSessionStorage('dataExplorer.resize.vertical', [0.25, 0.8])

  return (
    <QueryProvider>
      <ResultsProvider>
        <EditorProvider>
          <SidebarProvider>
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
                <Sidebar />
              </DraggableResizer.Panel>
            </DraggableResizer>
          </SidebarProvider>
        </EditorProvider>
      </ResultsProvider>
    </QueryProvider>
  )
}

export default FluxQueryBuilder

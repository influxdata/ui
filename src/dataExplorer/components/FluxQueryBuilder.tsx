import React, {FC, useState} from 'react'

// Components
import {
  AlignItems,
  DraggableResizer,
  FlexBox,
  FlexDirection,
  Orientation,
} from '@influxdata/clockface'
import {QueryProvider} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {ResultsProvider} from 'src/dataExplorer/components/ResultsContext'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import SidePane from 'src/dataExplorer/components/SidePane'
import Schema from 'src/dataExplorer/components/Schema'

// Styles
import './FluxQueryBuilder.scss'
import LeftArrow from 'assets/images/collapse-left.svg'
import RightArrow from 'assets/images/collapse-right.svg'

const INITIAL_VERT_RESIZER_HANDLE = 0.24

const FluxQueryBuilder: FC = () => {
  const [vertDragPosition, setVertDragPosition] = useState([
    INITIAL_VERT_RESIZER_HANDLE,
  ])
  const [showLeft, toggleLeftPanel] = useState(true)
  const [showRight, toggleRightPanel] = useState(true)

  return (
    <QueryProvider>
      <EditorProvider>
        <DraggableResizer
          handleOrientation={Orientation.Vertical}
          handlePositions={vertDragPosition}
          onChangePositions={setVertDragPosition}
        >
          <DraggableResizer.Panel style={showLeft ? {} : {display: 'none'}}>
            {showLeft && <Schema />}
          </DraggableResizer.Panel>
          <DraggableResizer.Panel className="new-data-explorer-rightside">
            <FlexBox
              direction={FlexDirection.Row}
              alignItems={AlignItems.FlexStart}
              style={{height: '100%'}}
            >
              <FlexBox.Child>
                <span onClick={() => toggleLeftPanel(!showLeft)}>
                  <img src={showLeft ? LeftArrow : RightArrow} />
                </span>
              </FlexBox.Child>
              <ResultsProvider>
                <ResultsPane />
              </ResultsProvider>
              <FlexBox.Child>
                <span onClick={() => toggleRightPanel(!showRight)}>
                  <img src={showRight ? RightArrow : LeftArrow} />
                </span>
              </FlexBox.Child>
            </FlexBox>
          </DraggableResizer.Panel>
          <DraggableResizer.Panel style={showRight ? {} : {display: 'none'}}>
            {showRight && <SidePane />}
          </DraggableResizer.Panel>
        </DraggableResizer>
      </EditorProvider>
    </QueryProvider>
  )
}

export default FluxQueryBuilder

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

const INITIAL_LEFT_VERT_RESIZER_HANDLE = 0.2
const INITIAL_RIGHT_VERT_RESIZER_HANDLE = 0.8

const FluxQueryBuilder: FC = () => {
  const [vertDragPosition, setVertDragPosition] = useState([
    INITIAL_LEFT_VERT_RESIZER_HANDLE,
    INITIAL_RIGHT_VERT_RESIZER_HANDLE,
  ])
  const [showLeft, toggleLeftPanel] = useState(true)
  const [showRight, toggleRightPanel] = useState(true)

  const adjustMiddlePanel = grow => {
    if (!grow) {
      return
    }
    const el = document.querySelector(
      '[data-testid="flux-query-builder-middle-panel"]'
    )
    if (el) {
      ;(el as any).style.flexGrow = 0.8 // eslint-disable-line
    }
  }

  return (
    <QueryProvider>
      <EditorProvider>
        <DraggableResizer
          handleOrientation={Orientation.Vertical}
          handlePositions={vertDragPosition}
          onChangePositions={setVertDragPosition}
        >
          <DraggableResizer.Panel style={showLeft ? {} : {display: 'none'}}>
            <Schema />
          </DraggableResizer.Panel>
          <DraggableResizer.Panel
            testID="flux-query-builder-middle-panel"
            className="new-data-explorer-rightside"
          >
            <FlexBox
              direction={FlexDirection.Row}
              alignItems={AlignItems.FlexStart}
              style={{height: '100%', width: '100%', position: 'absolute'}}
            >
              <FlexBox.Child>
                <span
                  onClick={() => {
                    toggleLeftPanel(!showLeft)
                    adjustMiddlePanel(showLeft)
                  }}
                  style={{marginLeft: '-20px', float: 'left'}}
                >
                  <img src={showLeft ? LeftArrow : RightArrow} />
                </span>
              </FlexBox.Child>
              <ResultsProvider>
                <ResultsPane />
              </ResultsProvider>
              <FlexBox.Child>
                <span
                  onClick={() => {
                    toggleRightPanel(!showRight)
                    adjustMiddlePanel(showRight)
                  }}
                  style={{
                    marginRight: '-20px',
                    float: 'right',
                    zIndex: '999',
                    position: 'absolute',
                  }}
                >
                  <img src={showRight ? RightArrow : LeftArrow} />
                </span>
              </FlexBox.Child>
            </FlexBox>
          </DraggableResizer.Panel>
          <DraggableResizer.Panel style={showRight ? {} : {display: 'none'}}>
            <SidePane />
          </DraggableResizer.Panel>
        </DraggableResizer>
      </EditorProvider>
    </QueryProvider>
  )
}

export default FluxQueryBuilder

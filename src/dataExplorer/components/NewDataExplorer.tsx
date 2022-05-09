import React, {FC, lazy, Suspense, useState} from 'react'
import {
  DraggableResizer,
  Orientation,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
  Button,
  IconFont,
  ComponentColor,
  ComponentStatus,
  ComponentSize,
  FlexBox,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'
import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'
import SubmitQueryButton from 'src/timeMachine/components/SubmitQueryButton'

import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import './NewDataExplorer.scss'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const INITIAL_VERT_RESIZER_HANDLE = 0.2
const INITIAL_HORIZ_RESIZER_HANDLE = 0.2

const NewDataExplorer: FC = () => {
  const [vertDragPosition, setVertDragPosition] = useState([INITIAL_VERT_RESIZER_HANDLE])
  const [horizDragPosition, setHorizDragPosition] = useState([INITIAL_HORIZ_RESIZER_HANDLE])

  const [text, setText] = useState('')
  const [editorInstance, setEditorInstance] = useState<EditorType>(null)
  const [timeRange, setTimeRange] = useState(DEFAULT_TIME_RANGE)

  const download = () => {
    event('CSV Download Initiated')
    basic(text).promise.then(response => {
      if (response.type !== 'SUCCESS') {
        return
      }

      downloadTextFile(response.csv, 'influx.data', '.csv', 'text/csv')
    })
  }

  const submit = () => {}

  return (
    <DraggableResizer
      handleOrientation={Orientation.Vertical}
      handlePositions={vertDragPosition}
      onChangePositions={setVertDragPosition}
    >
      <DraggableResizer.Panel>
        <h1>[ schema ]</h1>
      </DraggableResizer.Panel>
      <DraggableResizer.Panel
          className="new-data-explorer-rightside"
      >
        <DraggableResizer
          handleOrientation={Orientation.Horizontal}
          handlePositions={horizDragPosition}
          onChangePositions={setHorizDragPosition}
        >
          <DraggableResizer.Panel>
            <FlexBox
              direction={FlexDirection.Column}
              justifyContent={JustifyContent.FlexEnd}
              margin={ComponentSize.Small}
              style={{ height: '100%' }}
            >
              <div
                style={{ height: '100%', width: '100%', position: 'relative' }}
              >
              <Suspense
                fallback={
                  <SpinnerContainer
                    loading={RemoteDataState.Loading}
                    spinnerComponent={<TechnoSpinner />}
                  />
                }
              >
                <FluxMonacoEditor
                  script={text}
                  onChangeScript={setText}
                  setEditorInstance={setEditorInstance}
                />
              </Suspense>
              </div>
              <div style={{width: '100%'}}>
                <FlexBox
                  direction={FlexDirection.Row}
                  justifyContent={JustifyContent.FlexEnd}
                  margin={ComponentSize.Small}
                >
                  <Button
                    titleText="Download query results as a .CSV file"
                    text="CSV"
                    icon={IconFont.Download_New}
                    onClick={download}
                    status={text ? ComponentStatus.Default : ComponentStatus.Disabled}
                  />
                  <TimeRangeDropdown
                    timeRange={timeRange}
                    onSetTimeRange={setTimeRange}
                  />
                  <SubmitQueryButton
                    className="submit-btn"
                    text="Run"
                    icon={IconFont.Play}
                    submitButtonDisabled={!text}
                    queryStatus={status}
                    onSubmit={submit}
                    onNotify={() => {}}
                    queryID=""
                  />
                </FlexBox>
              </div>
            </FlexBox>
          </DraggableResizer.Panel>
          <DraggableResizer.Panel>
            <h1>[ results ]</h1>
          </DraggableResizer.Panel>
        </DraggableResizer>
      </DraggableResizer.Panel>
    </DraggableResizer>
  )
}

export default NewDataExplorer

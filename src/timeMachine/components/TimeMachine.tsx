// Libraries
import React, {useState, FunctionComponent} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'

// Components
import {DraggableResizer, Orientation} from '@influxdata/clockface'
import TimeMachineQueries from 'src/timeMachine/components/Queries'
import TimeMachineAlerting from 'src/timeMachine/components/TimeMachineAlerting'
import TimeMachineVis from 'src/timeMachine/components/Vis'
import ViewOptions from 'src/timeMachine/components/ViewOptions'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

const INITIAL_RESIZER_HANDLE = 0.4

const TimeMachine: FunctionComponent = () => {
  const {activeTab, isViewingVisOptions} = useSelector(getActiveTimeMachine)
  const [dragPosition, setDragPosition] = useState([INITIAL_RESIZER_HANDLE])

  const containerClassName = classnames('time-machine', {
    'time-machine--split': isViewingVisOptions,
  })

  let bottomContents: JSX.Element = null
  if (activeTab === 'alerting') {
    bottomContents = <TimeMachineAlerting />
  } else if (activeTab === 'queries') {
    bottomContents = <TimeMachineQueries />
  }

  return (
    <>
      {isViewingVisOptions && <ViewOptions />}
      <div className={containerClassName}>
        <DraggableResizer
          handleOrientation={Orientation.Horizontal}
          handlePositions={dragPosition}
          onChangePositions={setDragPosition}
        >
          <DraggableResizer.Panel>
            <div className="time-machine--top">
              <TimeMachineVis />
            </div>
          </DraggableResizer.Panel>
          <DraggableResizer.Panel>
            <ErrorBoundary>
              <div
                className="time-machine--bottom"
                data-testid="time-machine--bottom"
              >
                <div className="time-machine--bottom-contents">
                  {bottomContents}
                </div>
              </div>
            </ErrorBoundary>
          </DraggableResizer.Panel>
        </DraggableResizer>
      </div>
    </>
  )
}

export default TimeMachine

import React, {FC, useEffect, useState, useCallback} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import SaveAsCellForm from 'src/dataExplorer/components/SaveAsCellForm'
import SaveAsTaskForm from 'src/dataExplorer/components/SaveAsTaskForm'
import SaveAsVariable from 'src/dataExplorer/components/SaveAsVariable'
import {
  Overlay,
  Tabs,
  Alignment,
  ComponentSize,
  Orientation,
} from '@influxdata/clockface'

// Utils
import {event} from 'src/cloud/utils/reporting'

enum SaveAsOption {
  Dashboard = 'dashboard',
  Task = 'task',
  Variable = 'variable',
}

const SaveAsOverlay: FC = () => {
  const history = useHistory()
  const [saveAsOption, setSaveAsOption] = useState(SaveAsOption.Dashboard)
  const hide = useCallback(() => {
    history.goBack()
  }, [history])

  useEffect(() => {
    event('Data Explorer Save as Menu Changed', {menu: saveAsOption})
  }, [saveAsOption])

  let saveAsForm = <SaveAsCellForm dismiss={hide} />

  if (saveAsOption === SaveAsOption.Task) {
    saveAsForm = <SaveAsTaskForm dismiss={hide} />
  } else if (saveAsOption === SaveAsOption.Variable) {
    saveAsForm = <SaveAsVariable onHideOverlay={hide} />
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Save As"
          onDismiss={hide}
          testID="save-as-overlay--header"
        />
        <Overlay.Body>
          <Tabs.Container orientation={Orientation.Horizontal}>
            <Tabs alignment={Alignment.Center} size={ComponentSize.Medium}>
              <Tabs.Tab
                id={SaveAsOption.Dashboard}
                text="Dashboard Cell"
                testID="cell--radio-button"
                onClick={() => setSaveAsOption(SaveAsOption.Dashboard)}
                active={saveAsOption === SaveAsOption.Dashboard}
              />
              <Tabs.Tab
                id={SaveAsOption.Task}
                text="Task"
                testID="task--radio-button"
                onClick={() => setSaveAsOption(SaveAsOption.Task)}
                active={saveAsOption === SaveAsOption.Task}
              />
              <Tabs.Tab
                id={SaveAsOption.Variable}
                text="Variable"
                testID="variable--radio-button"
                onClick={() => setSaveAsOption(SaveAsOption.Variable)}
                active={saveAsOption === SaveAsOption.Variable}
              />
            </Tabs>
            <Tabs.TabContents>{saveAsForm}</Tabs.TabContents>
          </Tabs.Container>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default SaveAsOverlay

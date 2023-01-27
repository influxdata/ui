import React, {FC, useEffect, useState, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import SaveAsCellForm from 'src/dataExplorer/components/SaveAsCellForm'
import SaveAsNotebookForm from 'src/dataExplorer/components/SaveAsNotebookForm'
import SaveAsTaskForm from 'src/dataExplorer/components/SaveAsTaskForm'
import SaveAsVariable from 'src/dataExplorer/components/SaveAsVariable'
import {
  Overlay,
  Tabs,
  Alignment,
  ComponentSize,
  Orientation,
} from '@influxdata/clockface'

// Selectors
import {selectShouldShowNotebooks} from 'src/flows/selectors/flowsSelectors'
import {selectShouldShowResource} from 'src/shared/selectors/app'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {PROJECT_NAME} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

enum SaveAsOption {
  Dashboard = 'dashboard',
  Notebook = 'notebook',
  Task = 'task',
  Variable = 'variable',
}

const SaveAsOverlay: FC = () => {
  const history = useHistory()
  const shouldShowResource = useSelector(selectShouldShowResource)
  const shouldShowNotebooks = useSelector(selectShouldShowNotebooks)
  const shouldShowDashboards =
    shouldShowResource && !isFlagEnabled('hideDashboards')
  const shouldShowTasks = shouldShowResource && !isFlagEnabled('hideTasks')

  const [saveAsOption, setSaveAsOption] = useState(
    shouldShowDashboards ? SaveAsOption.Dashboard : SaveAsOption.Variable
  )

  const hide = useCallback(() => {
    history.goBack()
  }, [history])

  useEffect(() => {
    event('Data Explorer Save as Menu Changed', {menu: saveAsOption})
  }, [saveAsOption])

  let saveAsForm = <SaveAsCellForm dismiss={hide} />

  if (shouldShowTasks && saveAsOption === SaveAsOption.Task) {
    saveAsForm = <SaveAsTaskForm dismiss={hide} />
  } else if (saveAsOption === SaveAsOption.Variable) {
    saveAsForm = <SaveAsVariable onHideOverlay={hide} />
  } else if (shouldShowNotebooks && saveAsOption === SaveAsOption.Notebook) {
    saveAsForm = <SaveAsNotebookForm dismiss={hide} />
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
              {shouldShowDashboards && (
                <Tabs.Tab
                  id={SaveAsOption.Dashboard}
                  text="Dashboard Cell"
                  testID="cell--radio-button"
                  onClick={() => setSaveAsOption(SaveAsOption.Dashboard)}
                  active={saveAsOption === SaveAsOption.Dashboard}
                />
              )}
              {shouldShowTasks && (
                <Tabs.Tab
                  id={SaveAsOption.Task}
                  text="Task"
                  testID="task--radio-button"
                  onClick={() => setSaveAsOption(SaveAsOption.Task)}
                  active={saveAsOption === SaveAsOption.Task}
                />
              )}
              <Tabs.Tab
                id={SaveAsOption.Variable}
                text="Variable"
                testID="variable--radio-button"
                onClick={() => setSaveAsOption(SaveAsOption.Variable)}
                active={saveAsOption === SaveAsOption.Variable}
              />
              {shouldShowNotebooks && (
                <Tabs.Tab
                  id={SaveAsOption.Notebook}
                  text={`${PROJECT_NAME}`}
                  testID={`${PROJECT_NAME.toLowerCase()}--radio-button`}
                  onClick={() => setSaveAsOption(SaveAsOption.Notebook)}
                  active={saveAsOption === SaveAsOption.Notebook}
                />
              )}
            </Tabs>
            <Tabs.TabContents>{saveAsForm}</Tabs.TabContents>
          </Tabs.Container>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default SaveAsOverlay

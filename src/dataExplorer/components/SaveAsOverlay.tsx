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
import {selectIsNewIOxOrg} from 'src/shared/selectors/app'

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

export const SaveAsOverlay: FC = () => {
  const history = useHistory()
  const isNewIOxOrg = useSelector(selectIsNewIOxOrg)
  const shouldShowNotebooks = useSelector(selectShouldShowNotebooks)
  const shouldShowDashboards =
    !isNewIOxOrg || isFlagEnabled('showDashboardsInNewIOx')
  const shouldShowTasks = !isNewIOxOrg || isFlagEnabled('showTasksInNewIOx')
  const shouldShowVariables =
    !isNewIOxOrg || isFlagEnabled('showVariablesInNewIOx')

  const getActiveTab = (): SaveAsOption => {
    if (shouldShowDashboards) {
      return SaveAsOption.Dashboard
    } else if (shouldShowVariables) {
      return SaveAsOption.Variable
    } else if (shouldShowTasks) {
      return SaveAsOption.Task
    } else {
      return SaveAsOption.Notebook
    }
  }

  const [saveAsOption, setSaveAsOption] = useState(getActiveTab())

  const hide = useCallback(() => {
    history.goBack()
  }, [history])

  useEffect(() => {
    event('Data Explorer Save as Menu Changed', {menu: saveAsOption})
  }, [saveAsOption])

  // sets the default tab to be the first tab that is enabled
  let saveAsForm
  if (shouldShowDashboards) {
    saveAsForm = <SaveAsCellForm dismiss={hide} />
  } else if (shouldShowTasks) {
    saveAsForm = <SaveAsTaskForm dismiss={hide} />
  } else if (shouldShowVariables) {
    saveAsForm = <SaveAsVariable onHideOverlay={hide} />
  } else if (shouldShowNotebooks) {
    saveAsForm = <SaveAsNotebookForm dismiss={hide} />
  }

  // displays the correct tab based on the selected tab
  if (shouldShowTasks && saveAsOption === SaveAsOption.Task) {
    saveAsForm = <SaveAsTaskForm dismiss={hide} />
  } else if (shouldShowVariables && saveAsOption === SaveAsOption.Variable) {
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
              {shouldShowVariables && (
                <Tabs.Tab
                  id={SaveAsOption.Variable}
                  text="Variable"
                  testID="variable--radio-button"
                  onClick={() => setSaveAsOption(SaveAsOption.Variable)}
                  active={saveAsOption === SaveAsOption.Variable}
                />
              )}
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

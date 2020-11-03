// Libraries
import React, {FC, useContext} from 'react'
import {useDispatch} from 'react-redux'
import {RouteProps, useHistory, useLocation} from 'react-router-dom'

// Components
import ExportTaskButtons from './ExportTaskButtons'
import UpdateTaskBody from './UpdateTaskBody'
import CreateTaskBody from './CreateTaskBody'
import {OverlayContext, ExportAsTask} from 'src/flows/context/overlay'
import {
  Form,
  Grid,
  Alignment,
  Columns,
  ComponentSize,
  Overlay,
  Tabs,
  Orientation,
} from '@influxdata/clockface'

// Utils
import {saveNewScript, updateTask} from 'src/tasks/actions/thunks'

const ExportTaskOverlay: FC = () => {
  const {
    activeTab,
    handleSetActiveTab,
    handleSetError,
    interval,
    selectedTask,
    taskName,
  } = useContext(OverlayContext)

  const location: RouteProps['location'] = useLocation()
  const params = location.state
  const {queryText} = params[0]

  const formattedQueryText = queryText
    .trim()
    .split('|>')
    .join('\n  |>')

  const dispatch = useDispatch()

  const onCreate = () => {
    if (!/\d/.test(interval)) {
      handleSetError(true)
      return
    }
    const taskOption: string = `option task = { \n  name: "${taskName}",\n  every: ${interval},\n  offset: 0s\n}`
    const variable: string = `option v = {\n  timeRangeStart: -${interval},\n  timeRangeStop: now()\n}`
    const preamble = `${variable}\n\n${taskOption}`
    dispatch(saveNewScript(formattedQueryText, preamble))
  }

  const onUpdate = () => {
    if (!/\d/.test(interval) || !selectedTask?.name) {
      handleSetError(true)
      return
    }
    const taskOption: string = `option task = { \n  name: "${selectedTask.name}",\n  every: ${interval},\n  offset: 0s\n}`
    const variable: string = `option v = {\n  timeRangeStart: -${interval},\n  timeRangeStop: now()\n}`
    const preamble = `${variable}\n\n${taskOption}`
    dispatch(
      updateTask({
        script: formattedQueryText,
        preamble,
        interval,
        task: selectedTask,
      })
    )
  }

  const onSubmit = activeTab === ExportAsTask.Create ? onCreate : onUpdate
  const history = useHistory()

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Export As Task"
          onDismiss={() => history.goBack()}
          testID="export-as-overlay--header"
        />
        <Overlay.Body>
          <Tabs.Container orientation={Orientation.Horizontal}>
            <Tabs alignment={Alignment.Left} size={ComponentSize.Small}>
              <Tabs.Tab
                id={ExportAsTask.Create}
                text="Create New"
                testID="task--radio-button"
                onClick={() => handleSetActiveTab(ExportAsTask.Create)}
                active={activeTab === ExportAsTask.Create}
              />
              <Tabs.Tab
                id={ExportAsTask.Update}
                text="Update Existing"
                testID="variable-radio-button"
                onClick={() => handleSetActiveTab(ExportAsTask.Update)}
                active={activeTab === ExportAsTask.Update}
              />
            </Tabs>
            <Tabs.TabContents>
              <Form>
                <Grid>
                  <Grid.Row>
                    {activeTab === ExportAsTask.Create ? (
                      <CreateTaskBody formattedQueryText={formattedQueryText} />
                    ) : (
                      <UpdateTaskBody formattedQueryText={formattedQueryText} />
                    )}
                    <Grid.Column widthXS={Columns.Twelve}>
                      <ExportTaskButtons onSubmit={onSubmit} />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Form>
            </Tabs.TabContents>
          </Tabs.Container>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default ExportTaskOverlay

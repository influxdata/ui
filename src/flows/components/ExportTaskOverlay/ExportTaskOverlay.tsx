// Libraries
import React, {ChangeEvent, FC, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  Form,
  InputType,
  Input,
  Button,
  Grid,
  JustifyContent,
  AlignItems,
  Alignment,
  Columns,
  ComponentSize,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Overlay,
  Panel,
  Gradients,
  Tabs,
  Orientation,
  IconFont,
} from '@influxdata/clockface'

// Utils
import {saveNewScript} from 'src/tasks/actions/thunks'
import {getOrg} from 'src/organizations/selectors'
import {getTasks} from 'src/tasks/actions/thunks'
import {getAllTasks as getAllTasksSelector} from 'src/resources/selectors'

enum ExportAsTask {
  Create = 'create',
  Update = 'update',
}

const ExportTaskOverlay: FC = () => {
  const [activeTab, setActiveTab] = useState(ExportAsTask.Create)
  const [taskName, setTaskName] = useState('')
  const [interval, setInterval] = useState('')
  const history = useHistory()
  const tasks = useSelector(getAllTasksSelector)
  const org = useSelector(getOrg)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getTasks())
  }, [dispatch])

  const onDismiss = () => {
    history.goBack()
  }

  const onSubmit = () => {
    const task: string = `option task = { \n  name: "${taskName}",\n   every: ${interval},\n offset: 0s\n`
    const trimmedOrgName = org.name.trim()
    const trimmedBucketName = org.name.trim()
    const script: string = `${task}\n  |> to(bucket: "${trimmedBucketName}", org: "${trimmedOrgName}")`
    const preamble = `${task}`

    dispatch(saveNewScript(script, preamble))
  }
  const canSubmit = true

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Export As Task"
          onDismiss={onDismiss}
          testID="export-as-overlay--header"
        />
        <Overlay.Body>
          <Tabs.Container orientation={Orientation.Horizontal}>
            <Tabs alignment={Alignment.Left} size={ComponentSize.Small}>
              <Tabs.Tab
                id={ExportAsTask.Create}
                text="Create New"
                testID="task--radio-button"
                onClick={() => setActiveTab(ExportAsTask.Create)}
                active={activeTab === ExportAsTask.Create}
              />
              <Tabs.Tab
                id={ExportAsTask.Update}
                text="Update Existing"
                testID="variable-radio-button"
                onClick={() => setActiveTab(ExportAsTask.Update)}
                active={activeTab === ExportAsTask.Update}
              />
            </Tabs>
            <Tabs.TabContents>
              <Form>
                <Grid>
                  <Grid.Row>
                    <Grid.Column widthXS={Columns.Nine}>
                      <Form.Element label="Name">
                        <Input
                          name="name"
                          placeholder="Name your task"
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setTaskName(event.target.value)
                          }
                          value={taskName}
                          testID="task-form-name"
                        />
                      </Form.Element>
                    </Grid.Column>
                    <Grid.Column widthXS={Columns.Three}>
                      <Form.Element label="Run Every">
                        <Input
                          name="schedule"
                          type={InputType.Text}
                          placeholder="3h30s"
                          value={interval}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setInterval(event.target.value)
                          }
                          testID="task-form-schedule-input"
                        />
                      </Form.Element>
                    </Grid.Column>
                    {activeTab === ExportAsTask.Update && (
                      <Grid.Column widthXS={Columns.Twelve}>
                        <Panel
                          gradient={Gradients.LostGalaxy}
                          testID="panel"
                          style={{border: '1px #513CC6 solid'}}
                        >
                          <Panel.Body
                            justifyContent={JustifyContent.FlexStart}
                            alignItems={AlignItems.Center}
                          >
                            <Grid.Row>
                              <Grid.Column widthXS={Columns.One}>
                                <Button
                                  status={ComponentStatus.Disabled}
                                  size={ComponentSize.ExtraSmall}
                                  color={ComponentColor.Secondary}
                                  icon={IconFont.AlertTriangle}
                                />
                              </Grid.Column>
                              <Grid.Column widthXS={Columns.Eleven}>
                                <p>
                                  Note: changes made to an existing task cannot
                                  be undone
                                </p>
                              </Grid.Column>
                            </Grid.Row>
                          </Panel.Body>
                        </Panel>
                      </Grid.Column>
                    )}
                    <Grid.Column widthXS={Columns.Twelve}>
                      <code>Hello world |> this feels weird</code>
                    </Grid.Column>
                    <Grid.Column widthXS={Columns.Twelve}>
                      <Form.Footer>
                        <Button
                          text="Cancel"
                          onClick={onDismiss}
                          titleText="Cancel"
                          type={ButtonType.Button}
                        />
                        <Button
                          text="Export Task"
                          color={ComponentColor.Success}
                          type={ButtonType.Submit}
                          onClick={onSubmit}
                          status={
                            canSubmit
                              ? ComponentStatus.Default
                              : ComponentStatus.Disabled
                          }
                          testID="task-form-export"
                        />
                      </Form.Footer>
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

import React, {FC} from 'react'

// Components
import {
  Dropdown,
  Button,
  ButtonType,
  IconFont,
  ComponentColor,
  Columns,
  Form,
  Grid,
  AlignItems,
  FlexDirection,
  ComponentSize,
  InputType,
  SelectGroup,
  ButtonShape,
  Input,
  FlexBox,
  Page,
  JustifyContent,
} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {TaskSchedule} from 'src/types'

import 'src/tasks/containers/NewTasksPage.scss'

const NewTasksPage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Create Task'])}>
      <Page.Header fullWidth={true}>
        <Page.Title title="Create Task" />
      </Page.Header>
      <Page.Contents fullWidth={true} scrollable={false} className="">
        <Form onSubmit={() => {}}>
          <Grid>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Six}>
                <div className="create-task-titles">Select a Script</div>
                <p className="">
                  Select a Script below or create and save a new Script.
                </p>
                <Form.Element label="Script" required={true}>
                  <Dropdown
                    button={(active, onClick) => (
                      <Dropdown.Button
                        active={active}
                        onClick={onClick}
                        testID="variable-type-dropdown--button"
                      >
                        {}
                      </Dropdown.Button>
                    )}
                    menu={onCollapse => (
                      <Dropdown.Menu onCollapse={onCollapse}>
                        {[].map(v => (
                          <Dropdown.Item
                            key={v.type}
                            id={v.type}
                            testID={`variable-type-dropdown-${v.type}`}
                            value={v.type}
                            onClick={() => {}}
                            selected={v.type === variableType}
                          >
                            {v.label}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    )}
                  />
                </Form.Element>
                <div className="create-task-titles">Schedule the Task</div>
                <p className="">
                  Set the interval at which the task runs and an optional time
                  delay.
                </p>
                <SelectGroup shape={ButtonShape.StretchToFit}>
                  <SelectGroup.Option
                    name="task-schedule"
                    id="every"
                    active={true}
                    value={TaskSchedule.interval}
                    titleText="Run task at regular intervals"
                    onClick={() => {}}
                    testID="task-card-every-btn"
                  >
                    Every
                  </SelectGroup.Option>
                  <SelectGroup.Option
                    name="task-schedule"
                    id="cron"
                    active={false}
                    value={TaskSchedule.cron}
                    titleText="Use cron syntax for more control over scheduling"
                    onClick={() => {}}
                    testID="task-card-cron-btn"
                  >
                    Cron
                  </SelectGroup.Option>
                </SelectGroup>
                <Grid.Row>
                  <div style={{marginTop: '10px'}}>
                    <Grid.Column widthXS={Columns.Six}>
                      <Form.Element label="Every" required={true}>
                        <Input
                          name="Every"
                          type={InputType.Text}
                          //   value={}
                          placeholder="3h30s"
                          onChange={() => {}}
                          testID="task-form-every-input"
                        />
                      </Form.Element>
                    </Grid.Column>
                    <Grid.Column widthXS={Columns.Six}>
                      <Form.Element label="Offset" required={true}>
                        <Input
                          name="offset"
                          type={InputType.Text}
                          //   value={}
                          placeholder="20m"
                          onChange={() => {}}
                          testID="task-form-offset-input"
                        />
                      </Form.Element>
                    </Grid.Column>
                  </div>
                </Grid.Row>
                <div className="create-task-titles">Name the Task</div>
                <div style={{marginTop: '15px'}}></div>
                <Form.Element label="Name" required={true}>
                  <Input
                    name="name"
                    onChange={() => {}}
                    //   value={name}
                    testID="task-form-name"
                  />
                </Form.Element>
                <Form.Footer>
                  <Button
                    text="Cancel"
                    color={ComponentColor.Tertiary}
                    onClick={() => {}}
                  />

                  <Button
                    text="Schedule Task"
                    testID="button--schedule"
                    icon={IconFont.Calendar}
                    color={ComponentColor.Success}
                    type={ButtonType.Submit}
                  />
                </Form.Footer>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form>
      </Page.Contents>
    </Page>
  )
}

export default NewTasksPage

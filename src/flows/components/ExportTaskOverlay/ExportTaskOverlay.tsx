// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'

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

const ExportTaskOverlay: FC = () => {
  const {activeTab, handleSetActiveTab} = useContext(OverlayContext)

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
                      <CreateTaskBody />
                    ) : (
                      <UpdateTaskBody />
                    )}
                    <Grid.Column widthXS={Columns.Twelve}>
                      <ExportTaskButtons />
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

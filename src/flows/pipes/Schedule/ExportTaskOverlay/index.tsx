// Libraries
import React, {FC, useContext} from 'react'

// Components
import ExportTaskButtons from 'src/flows/pipes/Schedule/ExportTaskOverlay/ExportTaskButtons'
import UpdateTaskBody from 'src/flows/pipes/Schedule/ExportTaskOverlay/UpdateTaskBody'
import CreateTaskBody from 'src/flows/pipes/Schedule/ExportTaskOverlay/CreateTaskBody'
import {
  Provider,
  Context,
  ExportAsTask,
} from 'src/flows/pipes/Schedule/ExportTaskOverlay/context'
import {PopupContext} from 'src/flows/context/popup'

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
import {event} from 'src/cloud/utils/reporting'

const ExportTaskOverlay: FC = () => {
  const {activeTab, handleSetActiveTab} = useContext(Context)
  const {closeFn} = useContext(PopupContext)

  const closer = () => {
    event('Export Task Overlay Closed')

    closeFn()
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={700}>
        <Overlay.Header
          title="Export As Alert Task"
          onDismiss={closer}
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

export default () => (
  <Provider>
    <ExportTaskOverlay />
  </Provider>
)

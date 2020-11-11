// Libraries
import React, {FC, useContext} from 'react'

// Components
import ExportDashboardButtons from './ExportDashboardButtons'
import UpdateDashboardBody from './UpdateDashboardBody'
import CreateDashboardBody from './CreateDashboardBody'
import QueryTextPreview from 'src/flows/components/QueryTextPreview'
import Visualization from 'src/flows/pipes/Visualization/ExportDashboardOverlay/Visualization'
import {
  Context,
  Provider,
  ExportToDashboard,
} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'
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

const ExportDashboardOverlay: FC = () => {
  const {activeTab, handleSetActiveTab} = useContext(Context)
  const {closeFn} = useContext(PopupContext)

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Export To Dashboard"
          onDismiss={closeFn}
          testID="export-as-overlay--header"
        />
        <Overlay.Body>
          <Tabs.Container orientation={Orientation.Horizontal}>
            <Tabs alignment={Alignment.Left} size={ComponentSize.Small}>
              <Tabs.Tab
                id={ExportToDashboard.Create}
                text="Create New"
                testID="task--radio-button"
                onClick={() => handleSetActiveTab(ExportToDashboard.Create)}
                active={activeTab === ExportToDashboard.Create}
              />
              <Tabs.Tab
                id={ExportToDashboard.Update}
                text="Update Existing"
                testID="variable-radio-button"
                onClick={() => handleSetActiveTab(ExportToDashboard.Update)}
                active={activeTab === ExportToDashboard.Update}
              />
            </Tabs>
            <Tabs.TabContents>
              <Form>
                <Grid>
                  <Grid.Row>
                    {activeTab === ExportToDashboard.Create ? (
                      <CreateDashboardBody />
                    ) : (
                      <UpdateDashboardBody />
                    )}
                    <Grid.Column widthXS={Columns.Twelve}>
                      <Form.Element label="Preview">
                        <Visualization />
                      </Form.Element>
                    </Grid.Column>
                    <Grid.Column widthXS={Columns.Twelve}>
                      <QueryTextPreview />
                    </Grid.Column>
                    <Grid.Column widthXS={Columns.Twelve}>
                      <ExportDashboardButtons />
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
    <ExportDashboardOverlay />
  </Provider>
)

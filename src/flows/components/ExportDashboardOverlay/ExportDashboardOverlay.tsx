// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import ExportDashboardButtons from './ExportDashboardButtons'
import UpdateDashboardBody from './UpdateDashboardBody'
import CreateDashboardBody from './CreateDashboardBody'
import QueryTextPreview from 'src/flows/components/QueryTextPreview'
import Visualization from 'src/flows/components/ExportDashboardOverlay/Visualization'
import {
  DashboardOverlayContext,
  ExportToDashboard,
} from 'src/flows/context/dashboardOverlay'
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
  const {activeTab, handleSetActiveTab} = useContext(DashboardOverlayContext)

  const history = useHistory()

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Export To Dashboard"
          onDismiss={() => history.goBack()}
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

export default ExportDashboardOverlay

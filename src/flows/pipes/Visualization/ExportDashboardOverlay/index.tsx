// Libraries
import React, {FC} from 'react'

// Components
import ExportDashboardButtons from 'src/flows/pipes/Visualization/ExportDashboardOverlay/ExportDashboardButtons'
import ExportDashboardOverlayHeader from 'src/flows/pipes/Visualization/ExportDashboardOverlay/ExportDashboardOverlayHeader'
import ExportDashboardOverlayBody from 'src/flows/pipes/Visualization/ExportDashboardOverlay/ExportDashboardOverlayBody'
import QueryTextPreview from 'src/flows/components/QueryTextPreview'
import Visualization from 'src/flows/pipes/Visualization/ExportDashboardOverlay/Visualization'
import ExportDashboardOverlayTabs from 'src/flows/pipes/Visualization/ExportDashboardOverlay/ExportDashboardOverlayTabs'
import {Provider} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'
import {
  Form,
  Grid,
  Columns,
  Overlay,
  Tabs,
  Orientation,
} from '@influxdata/clockface'

const ExportDashboardOverlay: FC = () => {
  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={700}>
        <ExportDashboardOverlayHeader />
        <Overlay.Body>
          <Tabs.Container orientation={Orientation.Horizontal}>
            <ExportDashboardOverlayTabs />
            <Tabs.TabContents>
              <Form>
                <Grid>
                  <Grid.Row>
                    <ExportDashboardOverlayBody />
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

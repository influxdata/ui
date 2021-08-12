// Libraries
import React, {FC} from 'react'
import {Route, Switch} from 'react-router-dom'

// Components
import {Columns, ComponentColor, Dropdown, Grid} from '@influxdata/clockface'
import PluginCreateConfigurationWizard from 'src/writeData/components/PluginCreateConfigurationWizard'

// Constants
import {
  CONTENT_ID,
  ORGS,
  ORG_ID,
  TELEGRAF_PLUGINS,
} from 'src/shared/constants/routes'

// Styles
import 'src/writeData/components/AddPluginToConfiguration.scss'

interface AddPluginToConfigurationCTAProps {
  contentID: string
  history: {
    push: (route: string) => void
  }
  orgID: string
  pageContent: React.ReactElement
  thumbnail: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
}

export const AddPluginToConfigurationCTA: FC<AddPluginToConfigurationCTAProps> = ({
  contentID,
  history,
  orgID,
  thumbnail,
  pageContent,
}) => (
  <>
    <div className="write-data--details">
      <Grid>
        <Grid.Row>
          <Grid.Column
            widthXS={Columns.Twelve}
            widthMD={Columns.Six}
            widthLG={Columns.Three}
          >
            <div className="write-data--details-thumbnail">{thumbnail}</div>
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  color={ComponentColor.Primary}
                  style={{width: '100%'}}
                  onClick={onClick}
                >
                  Use this plugin
                </Dropdown.Button>
              )}
              className="use-plugin--telegraf-configuration"
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  <Dropdown.Item
                    key="Create-new-configuration-telegraf-plugin"
                    value="Create a new configuration"
                    onClick={() => {
                      history.push(
                        `/${ORGS}/${orgID}/load-data/${TELEGRAF_PLUGINS}/${contentID}/new`
                      )
                    }}
                    selected={false}
                  >
                    <span>Create a new configuration</span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    key="Add-to-existing-configuration-telegraf-plugin"
                    value="Add to an existing configuration"
                    onClick={() => {}}
                    selected={false}
                  >
                    <span>Add to an existing configuration</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              )}
              style={{width: 'auto'}}
            />
          </Grid.Column>
          <Grid.Column
            widthXS={Columns.Twelve}
            widthMD={Columns.Six}
            widthLG={Columns.Nine}
          >
            <div
              className="write-data--details-content markdown-format"
              data-testid="load-data-details-content"
            >
              {pageContent}
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
    <Switch>
      <Route
        path={`/${ORGS}/${ORG_ID}/load-data/${TELEGRAF_PLUGINS}/${CONTENT_ID}/new`}
        component={PluginCreateConfigurationWizard}
      />
    </Switch>
  </>
)

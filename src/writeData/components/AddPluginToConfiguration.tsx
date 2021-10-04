// Libraries
import React, {FC, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Route, Switch} from 'react-router-dom'

// Components
import {Columns, ComponentColor, Dropdown, Grid} from '@influxdata/clockface'
import PluginCreateConfiguration from 'src/writeData/components/PluginCreateConfigurationWizard'
import PluginAddToExistingConfiguration from 'src/writeData/components/PluginAddToExistingConfiguration/Wizard'

// Actions
import {getTelegrafs} from 'src/telegrafs/actions/thunks'

// Constants
import {
  CONTENT_ID,
  ORGS,
  ORG_ID,
  TELEGRAF_PLUGINS,
} from 'src/shared/constants/routes'

// Types
import {AppState} from 'src/types'

// Selectors
import {getAllTelegrafs} from 'src/resources/selectors'

// Styles
import 'src/writeData/components/AddPluginToConfiguration.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'

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

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & AddPluginToConfigurationCTAProps

const AddPluginToConfigurationCTAComponent: FC<Props> = props => {
  const {
    contentID,
    fetchTelegrafs,
    history,
    orgID,
    pageContent,
    telegrafs,
    thumbnail,
  } = props

  useEffect(() => {
    fetchTelegrafs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const autoWidth = {width: 'auto'}
  const fullWidth = {width: '100%'}
  const createNewConfiguration = () => {
    history.push(
      `/${ORGS}/${orgID}/load-data/${TELEGRAF_PLUGINS}/${contentID}/new`
    )
    event('load_data.telegraf_plugins.create_new_configuration')
  }
  const addToConfiguration = () => {
    history.push(
      `/${ORGS}/${orgID}/load-data/${TELEGRAF_PLUGINS}/${contentID}/add`
    )
    event('load_data.telegraf_plugins.add_to_existing_configuration')
  }
  return (
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
                    style={fullWidth}
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
                      onClick={createNewConfiguration}
                      selected={false}
                      testID="create-new-configuration-from-plugin--dropdown-item"
                    >
                      <span>Create a new configuration</span>
                    </Dropdown.Item>
                    {telegrafs?.length && (
                      <Dropdown.Item
                        key="Add-to-existing-configuration-telegraf-plugin"
                        value="Add to an existing configuration"
                        onClick={addToConfiguration}
                        selected={false}
                        testID="add-to-existing-configuration-from-plugin--dropdown-item"
                      >
                        <span>Add to an existing configuration</span>
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                )}
                style={autoWidth}
                testID="add-plugin-to-configuration--dropdown"
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
          component={PluginCreateConfiguration}
        />
        <Route
          path={`/${ORGS}/${ORG_ID}/load-data/${TELEGRAF_PLUGINS}/${CONTENT_ID}/add`}
          component={PluginAddToExistingConfiguration}
        />
      </Switch>
    </>
  )
}

const mstp = (state: AppState) => ({
  telegrafs: getAllTelegrafs(state),
})

const mdtp = {
  fetchTelegrafs: getTelegrafs,
}

const connector = connect(mstp, mdtp)

export const AddPluginToConfigurationCTA = connector(
  AddPluginToConfigurationCTAComponent
)

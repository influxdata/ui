// Libraries
import React, {Component} from 'react'
import {Switch, Route} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'
import VariablesTab from 'src/variables/components/VariablesTab'
import GetResources from 'src/resources/components/GetResources'

import {
  CreateVariableOverlay,
  VariableImportOverlay,
  RenameVariableOverlay,
  UpdateVariableOverlay,
  ExportVariableOverlay,
} from 'src/overlays/components'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {ResourceType} from 'src/types'

import {ORGS, ORG_ID, SETTINGS, VARIABLES} from 'src/shared/constants/routes'

const varsPath = `/${ORGS}/${ORG_ID}/${SETTINGS}/${VARIABLES}`

@ErrorHandling
class VariablesIndex extends Component {
  public render() {
    return (
      <>
        <Page titleTag={pageTitleSuffixer(['Variables', 'Settings'])}>
          <SettingsHeader />
          <SettingsTabbedPage activeTab="variables">
            <GetResources resources={[ResourceType.Variables]}>
              <VariablesTab />
            </GetResources>
          </SettingsTabbedPage>
        </Page>
        <Switch>
          <Route
            path={`${varsPath}/import`}
            component={VariableImportOverlay}
          />
          <Route
            path={`${varsPath}/:id/export`}
            component={ExportVariableOverlay}
          />
          <Route path={`${varsPath}/new`} component={CreateVariableOverlay} />
          <Route
            path={`${varsPath}/:id/rename`}
            component={RenameVariableOverlay}
          />
          <Route
            path={`${varsPath}/:id/edit`}
            component={UpdateVariableOverlay}
          />
        </Switch>
      </>
    )
  }
}

export default VariablesIndex

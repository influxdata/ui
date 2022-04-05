// Libraries
import React, {PureComponent} from 'react'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'
import LabelsTab from 'src/labels/components/LabelsTab'
import GetResources from 'src/resources/components/GetResources'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {ResourceType} from 'src/types'

@ErrorHandling
class LabelsIndex extends PureComponent {
  public render() {
    const {children} = this.props

    return (
      <>
        <Page titleTag={pageTitleSuffixer(['Labels', 'Settings'])}>
          <SettingsHeader />
          <SettingsTabbedPage activeTab="labels">
            <GetResources resources={[ResourceType.Labels]}>
              <LabelsTab />
            </GetResources>
          </SettingsTabbedPage>
        </Page>
        {children}
      </>
    )
  }
}

export default LabelsIndex

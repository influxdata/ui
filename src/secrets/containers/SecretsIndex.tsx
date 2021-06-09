// Libraries
import React, {FC} from 'react'
import {useSelector, connect} from 'react-redux'

// Components
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Selectors
import {getOrg} from 'src/organizations/selectors'

const SecretsIndex: FC = () => {
  const org = useSelector(getOrg)

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Secrets', 'Settings'])}>
        <SettingsHeader />
        <SettingsTabbedPage activeTab="secrets" orgID={org.id}>
          <div>Placeholder</div>
        </SettingsTabbedPage>
      </Page>
    </>
  )
}

export default SecretsIndex

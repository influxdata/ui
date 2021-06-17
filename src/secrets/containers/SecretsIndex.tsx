// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps, useSelector} from 'react-redux'

// Components
import SettingsTabbedPage from 'src/settings/components/SettingsTabbedPage'
import SettingsHeader from 'src/settings/components/SettingsHeader'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {AppState, ResourceType} from 'src/types'
import SecretsTab from 'src/secrets/components/SecretsTab'
import GetResources from 'src/resources/components/GetResources'

type ReduxProps = ConnectedProps<typeof connector>

const SecretsIndex: FC<ReduxProps> = () => {
  const org = useSelector(getOrg)

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Secrets', 'Settings'])}>
        <SettingsHeader />
        <SettingsTabbedPage activeTab="secrets" orgID={org.id}>
          <GetResources resources={[ResourceType.Secrets]}>
            <SecretsTab />
          </GetResources>
        </SettingsTabbedPage>
      </Page>
    </>
  )
}

const mstp = (state: AppState) => ({org: getOrg(state)})

const connector = connect(mstp, null)

export default connector(SecretsIndex)

// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Components
import {UserAccountProvider} from 'src/accounts/context/userAccount'
import {UserDefaults} from 'src/identity/components/userprofile/UserDefaults'
import {UserDetails} from 'src/identity/components/userprofile/UserDetails'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

export const UserProfilePage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['User Profile'])}>
      <Page.Header fullWidth={true}>
        <Page.Title title="User Profile" />
      </Page.Header>
      <Page.Contents fullWidth={true}>
        <UserDetails />

        <UserAccountProvider>
          <UserDefaults />
        </UserAccountProvider>
      </Page.Contents>
    </Page>
  )
}

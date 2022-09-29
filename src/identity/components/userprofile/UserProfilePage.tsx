// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Components
import {UserDefaults} from 'src/identity/components/userprofile/UserDefaults'
import {UserDetails} from 'src/identity/components/userprofile/UserDetails'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

export const UserProfilePage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['User Profile'])}>
      <Page.Header fullWidth={true}>
        <Page.Title title="User Profile" testID="user-profile--page" />
      </Page.Header>
      <Page.Contents fullWidth={true}>
        <UserDetails />
        <UserDefaults />
      </Page.Contents>
    </Page>
  )
}

// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import UserList from 'src/users/components/UserList'
import UserListInviteForm from 'src/users/components/UserListInviteForm'
import OrgHeader from 'src/organizations/components/OrgHeader'
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const UserListContainer: FC = () => {
  const subTitle = isFlagEnabled('multiAccount') ? 'Members' : 'Users'

  return (
    <Page titleTag={pageTitleSuffixer([subTitle, 'Organization'])}>
      <OrgHeader testID="users-page--header" />
      <OrgTabbedPage activeTab="users">
        <>
          <UserListInviteForm />
          <UserList />
        </>
      </OrgTabbedPage>
    </Page>
  )
}

export default UserListContainer

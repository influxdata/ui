// Libraries
import React, {FC} from 'react'
import {useParams} from 'react-router'
import {Link} from 'react-router-dom'
import {Page, Tabs, Orientation, ComponentSize} from '@influxdata/clockface'

// Components
import UserList from 'src/users/components/UserList'
import UserListInviteForm from 'src/users/components/UserListInviteForm'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const UserListContainer: FC = () => {
  const {orgID} = useParams<{orgID: string}>()

  return (
    <Page titleTag={pageTitleSuffixer(['Users', 'Organization'])}>
      <Page.Header fullWidth={true} testID="users-page--header">
        <Page.Title title="Organization" />
        <RateLimitAlert />
      </Page.Header>
      <Page.Contents scrollable={true}>
        <Tabs.Container orientation={Orientation.Horizontal}>
          <Tabs size={ComponentSize.Large}>
            <Tabs.Tab
              id="users"
              text="Users"
              active={true}
              linkElement={className => (
                <Link className={className} to={`/orgs/${orgID}/users`} />
              )}
            />
            <Tabs.Tab
              id="about"
              text="About"
              active={false}
              linkElement={className => (
                <Link className={className} to={`/orgs/${orgID}/about`} />
              )}
            />
          </Tabs>
          <Tabs.TabContents>
            <UserListInviteForm />
            <UserList />
          </Tabs.TabContents>
        </Tabs.Container>
      </Page.Contents>
    </Page>
  )
}

export default UserListContainer

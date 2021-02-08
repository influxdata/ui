// Libraries
import React, {FC} from 'react'
import {useParams} from 'react-router'

import {Page, Tabs, Orientation, ComponentSize} from '@influxdata/clockface'

// Components
import UserList from './UserList'
import UserListInviteForm from './UserListInviteForm'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

const UserListContainer: FC = () => {
  const {orgID} = useParams<{orgID: string}>()

  return (
    <Page titleTag="Users">
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
                <a className={className} href={`/orgs/${orgID}/users`} />
              )}
            />
            <Tabs.Tab
              id="about"
              text="About"
              active={false}
              linkElement={className => (
                <a className={className} href={`/orgs/${orgID}/about`} />
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

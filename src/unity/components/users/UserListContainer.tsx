// Libraries
import React, {FC, useReducer, Dispatch} from 'react'
import {useParams} from 'react-router'
import {useSelector} from 'react-redux'

import {
  Page,
  Tabs,
  Orientation,
  ComponentSize,
  RemoteDataState,
} from '@influxdata/clockface'
import {CloudUser as User, Invite} from 'src/types'

// Components
import UserList from './UserList'
import UserListInviteForm from './UserListInviteForm'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

// Selectors
import {getMe} from 'src/me/selectors'

import {
  UserListState,
  Action,
  userListReducer,
  UserListReducer,
  initialState,
} from 'src/unity/reducers'

export const UserListContext = React.createContext(null)
export type UserListContextResult = [UserListState, Dispatch<Action>]

interface Props {
  users: User[]
  invites: Invite[]
}

const UserListContainer: FC<Props> = ({users = [], invites = []}) => {
  const {orgID} = useParams<{orgID: string}>()
  const {id} = useSelector(getMe)

  const [state, dispatch] = useReducer<UserListReducer>(
    userListReducer,
    initialState({
      currentUserID: id,
      users: users.map(user => ({...user, status: RemoteDataState.Done})),
      invites: invites.map(invite => ({
        ...invite,
        status: RemoteDataState.Done,
      })),
      organizationID: orgID,
    })
  )

  return (
    <Page titleTag="Users">
      <Page.Header fullWidth={true} testID="data-explorer--header">
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
                <a
                  className={className}
                  href={`/organizations/${orgID}/users`}
                />
              )}
            />
            <Tabs.Tab
              id="about"
              text="About"
              active={false}
              linkElement={className => (
                <a className={className} href="/about" />
              )}
            />
          </Tabs>
          <Tabs.TabContents>
            <UserListContext.Provider value={[state, dispatch]}>
              <UserListInviteForm />
              <UserList />
            </UserListContext.Provider>
          </Tabs.TabContents>
        </Tabs.Container>
      </Page.Contents>
    </Page>
  )
}

export default UserListContainer

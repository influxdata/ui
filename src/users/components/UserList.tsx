// Libraries
import React, {FC, useContext, useState} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {Columns, Grid, IndexList} from '@influxdata/clockface'
import {UsersContext} from 'src/users/context/users'
import {UserListItem} from 'src/users/components/UserListItem'
import {InviteListItem} from 'src/users/components/InviteListItem'

// Overlays
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

// Types
import {RemoveMemberOverlayParams} from 'src/users/components/RemoveMemberOverlay'

// Utils
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import {filter} from 'src/users/utils/filter'

export const UserList: FC = () => {
  const {removeUser, users, invites} = useContext(UsersContext)
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const filteredUsers = filter(
    users,
    ['email', 'firstName', 'lastName', 'role'],
    searchTerm
  )
  const filteredInvites = filter(invites, ['email', 'role'], searchTerm)

  const isDeletable = users.length > 1

  const handleRemoveUser = (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const userToRemove = users.find(user => user.id === evt.currentTarget.id)
    const params: RemoveMemberOverlayParams = {removeUser, users, userToRemove}

    dispatch(showOverlay('remove-member', params, () => dismissOverlay()))
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthMD={Columns.Ten} widthLG={Columns.Six}>
          <SearchWidget
            placeholderText="Search members"
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
          />
        </Grid.Column>
      </Grid.Row>
      <IndexList>
        <IndexList.Header>
          <IndexList.HeaderCell width="30%" columnName="email" />
          <IndexList.HeaderCell width="30%" columnName="name" />
          <IndexList.HeaderCell width="10%" columnName="role" />
          <IndexList.HeaderCell width="20%" columnName="status" />
          <IndexList.HeaderCell width="10%" columnName="" />
        </IndexList.Header>
        <IndexList.Body emptyState={null} columnCount={4}>
          {filteredInvites.map(invite => (
            <InviteListItem key={`invite-${invite.id}`} invite={invite} />
          ))}
          {filteredUsers.map(user => (
            <UserListItem
              handleRemoveUser={handleRemoveUser}
              key={`user-${user.id}`}
              user={user}
              isDeletable={isDeletable}
            />
          ))}
        </IndexList.Body>
      </IndexList>
    </Grid>
  )
}

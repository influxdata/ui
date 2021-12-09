// Libraries
import React, {FC, useContext, useState} from 'react'

// Components
import {Columns, Grid, IndexList} from '@influxdata/clockface'
import {UsersContext} from 'src/users/context/users'
import UserListItem from 'src/users/components/UserListItem'
import InviteListItem from 'src/users/components/InviteListItem'

// Utils
import {filter} from 'src/users/utils/filter'
import SearchWidget from '../../shared/components/search_widget/SearchWidget'

const UserList: FC = () => {
  const {users, invites} = useContext(UsersContext)

  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = filter(
    users,
    ['email', 'firstName', 'lastName', 'role'],
    searchTerm
  )

  const filteredInvites = filter(invites, ['email', 'role'], searchTerm)

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthMD={Columns.Ten} widthLG={Columns.Six}>
          <SearchWidget
            placeholderText="Filter members..."
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
          />
        </Grid.Column>
      </Grid.Row>
      <IndexList>
        <IndexList.Header>
          <IndexList.HeaderCell width="30%" columnName="email" />
          {/* TODO: add back in once https://github.com/influxdata/quartz/issues/2389 back-filling of names is complete */}
          {/* <IndexList.HeaderCell width="30%" columnName="name" />*/}
          <IndexList.HeaderCell width="10%" columnName="role" />
          <IndexList.HeaderCell width="20%" columnName="status" />
          <IndexList.HeaderCell width="10%" columnName="" />
        </IndexList.Header>
        <IndexList.Body emptyState={null} columnCount={4}>
          {filteredInvites.map(invite => (
            <InviteListItem key={`invite-${invite.id}`} invite={invite} />
          ))}
          {filteredUsers.map(user => (
            <UserListItem key={`user-${user.id}`} user={user} />
          ))}
        </IndexList.Body>
      </IndexList>
    </Grid>
  )
}

export default UserList

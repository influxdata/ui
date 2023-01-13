// Libraries
import React, {FC} from 'react'

// Components
import {UsersProvider} from 'src/users/context/users'
import UsersPage from 'src/users/components/UsersPage'

const Users: FC = () => (
  <UsersProvider>
    <UsersPage />
  </UsersProvider>
)

export default Users

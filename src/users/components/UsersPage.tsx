// Libraries
import React, {useContext} from 'react'

// Components
import PageSpinner from 'src/perf/components/PageSpinner'
import UsersListContainer from 'src/users/components/UserListContainer'
import {UsersContext} from 'src/users/context/users'

function UsersPage() {
  const {status} = useContext(UsersContext)

  return (
    <PageSpinner loading={status}>
      <UsersListContainer />
    </PageSpinner>
  )
}

export default UsersPage

// Libraries
import React, {useContext} from 'react'

// Components
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import UsersListContainer from './UserListContainer'

// Thunks
import {UsersContext} from 'src/users/context/users'

function UsersPage() {
  const {status} = useContext(UsersContext)

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={status}>
      <UsersListContainer />
    </SpinnerContainer>
  )
}

export default UsersPage

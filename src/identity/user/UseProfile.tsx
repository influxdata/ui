// Libraries
import React, {FC} from 'react'
import {UserAccountProvider} from 'src/accounts/context/userAccount'
import {UserProfilePage} from './ProfilePage'

export const UserProfileContainer: FC = () => {
  return (
    <UserAccountProvider>
      <UserProfilePage />
    </UserAccountProvider>
  )
}

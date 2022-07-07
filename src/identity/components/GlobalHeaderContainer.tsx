import React, {FC} from 'react'
import {UserAccountProvider} from 'src/accounts/context/userAccount'
import {GlobalHeader} from 'src/identity/components/GlobalHeader/GlobalHeader'

export const GlobalHeaderContainer: FC = () => {
  return (
    <UserAccountProvider>
      <GlobalHeader />
    </UserAccountProvider>
  )
}

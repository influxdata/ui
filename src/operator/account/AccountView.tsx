// Libraries
import React, {FC, useContext} from 'react'
import {
  AppWrapper,
  Page,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import {get} from 'lodash'

// Components
import AppPageHeader from 'src/operator/AppPageHeader'
import AssociatedOrgsTable from 'src/operator/account/AssociatedOrgsTable'
import AssociatedUsersTable from 'src/operator/account/AssociatedUsersTable'
import DeleteAccountOverlay from 'src/operator/account/DeleteAccountOverlay'
import AccountViewHeader from 'src/operator/account/AccountViewHeader'
import AccountGrid from 'src/operator/account/AccountGrid'
import {AccountContext} from 'src/operator/context/account'

interface Props {
  removeUserFromAccount?: (userId: string, accountId: string) => Promise<void>
}

const AccountView: FC<Props> = ({removeUserFromAccount}) => {
  const {account, accountStatus, handleGetAccount} = useContext(AccountContext)

  const removeUser = async (userId: string) => {
    try {
      await removeUserFromAccount(userId, accountID)
    } catch (error) {
      console.error(error)
    }
    await handleGetAccount()
  }

  return (
    <AppWrapper>
      <Page titleTag={`Account ${account.id}`}>
        <AppPageHeader title={`Account ${account.id}`} />
        <Page.Contents scrollable={true}>
          <DeleteAccountOverlay />
          <SpinnerContainer
            loading={accountStatus}
            spinnerComponent={<TechnoSpinner diameterPixels={100} />}
          >
            <AccountViewHeader />
            <AccountGrid />
            <h2>Associated Users</h2>
            <AssociatedUsersTable removeResource={removeUser} />
            <h2>Associated Organizations</h2>
            <AssociatedOrgsTable />
          </SpinnerContainer>
        </Page.Contents>
      </Page>
    </AppWrapper>
  )
}

export default AccountView

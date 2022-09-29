// Libraries
import React, {FC, useContext} from 'react'
import {AppWrapper, Page} from '@influxdata/clockface'

// Components
import AppPageHeader from 'src/operator/AppPageHeader'
import AssociatedOrgsTable from 'src/operator/account/AssociatedOrgsTable'
import AssociatedUsersTable from 'src/operator/account/AssociatedUsersTable'
import ConvertAccountToContractOverlay from 'src/operator/account/ConvertAccountToContractOverlay'
import DeleteAccountOverlay from 'src/operator/account/DeleteAccountOverlay'
import AccountViewHeader from 'src/operator/account/AccountViewHeader'
import AccountGrid from 'src/operator/account/AccountGrid'
import {AccountContext} from 'src/operator/context/account'
import PageSpinner from 'src/perf/components/PageSpinner'

const AccountView: FC = () => {
  const {account, accountStatus} = useContext(AccountContext)

  let accountTitle = 'loading....'
  if (account) {
    if (account?.name) {
      accountTitle = `${account.name} (${account.id})`
    } else {
      accountTitle = `Account ${account.id}`
    }
  }

  return (
    <PageSpinner loading={accountStatus}>
      <AppWrapper>
        <Page titleTag={accountTitle} testID="account-view--header">
          <AppPageHeader title={accountTitle} />
          <Page.Contents scrollable={true}>
            <ConvertAccountToContractOverlay />
            <DeleteAccountOverlay />
            <AccountViewHeader />
            <AccountGrid />
            <h2 data-testid="associated-users--title">Associated Users</h2>
            <AssociatedUsersTable />
            <h2 data-testid="associated-orgs--title">
              Associated Organizations
            </h2>
            <AssociatedOrgsTable />
          </Page.Contents>
        </Page>
      </AppWrapper>
    </PageSpinner>
  )
}

export default AccountView

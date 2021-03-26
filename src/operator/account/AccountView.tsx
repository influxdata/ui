// Libraries
import React, {FC, useContext} from 'react'
import {AppWrapper, Page} from '@influxdata/clockface'

// Components
import AppPageHeader from 'src/operator/AppPageHeader'
import AssociatedOrgsTable from 'src/operator/account/AssociatedOrgsTable'
import AssociatedUsersTable from 'src/operator/account/AssociatedUsersTable'
import DeleteAccountOverlay from 'src/operator/account/DeleteAccountOverlay'
import AccountViewHeader from 'src/operator/account/AccountViewHeader'
import AccountGrid from 'src/operator/account/AccountGrid'
import {AccountContext} from 'src/operator/context/account'
import PageSpinner from 'src/perf/components/PageSpinner'

const AccountView: FC = () => {
  const {account, accountStatus} = useContext(AccountContext)

  return (
    <PageSpinner loading={accountStatus}>
      <AppWrapper>
        <Page titleTag={`Account ${account?.id}`}>
          <AppPageHeader title={`Account ${account?.id}`} />
          <Page.Contents scrollable={true}>
            <DeleteAccountOverlay />
            <AccountViewHeader />
            <AccountGrid />
            <h2>Associated Users</h2>
            <AssociatedUsersTable />
            <h2>Associated Organizations</h2>
            <AssociatedOrgsTable />
          </Page.Contents>
        </Page>
      </AppWrapper>
    </PageSpinner>
  )
}

export default AccountView

// Libraries
import React, {FC, useContext} from 'react'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import UserAccountProvider from './context/userAccount'
import AccountTabContainer from './AccountTabContainer'

import {UserAccountContext} from 'src/accounts/context/userAccount'

const AccountAboutPage: FC = () => {
  const {userAccounts, defaultAccountId} = useContext(UserAccountContext)

  console.log('got userAccounts???', userAccounts)
  console.log('arghh, default account id?', defaultAccountId)

  return (
    <Page titleTag={pageTitleSuffixer(['About', 'Account'])}>
      <AccountTabContainer activeTab="about">
        <>
          <h1 data-testid="account-about--header">
            hello world on the account about page
          </h1>
        </>
      </AccountTabContainer>
    </Page>
  )
}

const AccountPage: FC = () => {
  //todo:  look at userlistcontainer for a tabbed example!

  return (
    <Page titleTag={pageTitleSuffixer(['Account About page....'])}>
      <UserAccountProvider>
        <AccountAboutPage />
      </UserAccountProvider>
    </Page>
  )
}

export default AccountPage

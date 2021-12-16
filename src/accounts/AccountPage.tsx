// Libraries
import React, {FC, useContext} from 'react'
//import {Switch, Route} from 'react-router-dom'
import {Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import UserAccountProvider from './context/userAccount'
// import {event, useLoadTimeReporting} from 'src/cloud/utils/reporting'
// import {FeatureFlag} from 'src/shared/utils/featureFlag'
//
//
// import {AppSettingContext} from 'src/shared/contexts/app'
import {UserAccountContext} from './context/userAccount'

const AccountAboutPage: FC = () => {
  const {userAccounts, defaultAccountId} = useContext(UserAccountContext)

  console.log('got userAccounts???', userAccounts)
  console.log('arghh, default account id?', defaultAccountId)

  return (
    <h1 data-testid="account-about--header">
      {' '}
      hello world on the account about page
    </h1>
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

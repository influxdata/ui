// Libraries
import React, {FC, useContext, useState} from 'react'
import {Button, IconFont, Overlay, Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import UserAccountProvider from './context/userAccount'
import AccountTabContainer from './AccountTabContainer'

import {UserAccountContext} from 'src/accounts/context/userAccount'

import {SwitchAccountOverlay} from 'src/accounts/SwitchAccountOverlay'

const AccountAboutPage: FC = () => {
  const {userAccounts, defaultAccountId, activeAccountId} = useContext(
    UserAccountContext
  )
  const [isSwitchAccountVisible, setSwitchAccountVisible] = useState(false)

  console.log('got userAccounts???', userAccounts)
  console.log('arghh, default account id?', defaultAccountId)
  console.log('active acct id???', activeAccountId)

  const switchAccount = () => {
    // show the dialog
    setSwitchAccountVisible(true)
  }

  const handleDismissOverlay = () => {
    setSwitchAccountVisible(false)
  }

  return (
    <Page titleTag={pageTitleSuffixer(['About', 'Account'])}>
      <AccountTabContainer activeTab="about">
        <>
          <h1 data-testid="account-about--header">
            hello world on the account settings page
          </h1>
          {userAccounts && userAccounts.length >= 2 && (
            <Button
              text="Switch Account"
              icon={IconFont.Switch_New}
              onClick={switchAccount}
              testID="user-account-switch-btn"
            />
          )}

          <Overlay visible={isSwitchAccountVisible}>
            <SwitchAccountOverlay onDismissOverlay={handleDismissOverlay} />
          </Overlay>
        </>
      </AccountTabContainer>
    </Page>
  )
}

const AccountPage: FC = () => {
  //todo:  look at userlistcontainer for a tabbed example!

  return (
    <Page titleTag={pageTitleSuffixer(['Account Settings Page'])}>
      <UserAccountProvider>
        <AccountAboutPage />
      </UserAccountProvider>
    </Page>
  )
}

export default AccountPage

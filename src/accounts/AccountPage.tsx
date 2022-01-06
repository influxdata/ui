// Libraries
import React, {FC, useContext, useState} from 'react'
import {Button, IconFont, Overlay, Page} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import UserAccountProvider from 'src/accounts/context/userAccount'
import AccountTabContainer from 'src/accounts/AccountTabContainer'

import {UserAccountContext} from 'src/accounts/context/userAccount'

import {SwitchAccountOverlay} from 'src/accounts/SwitchAccountOverlay'

const AccountAboutPage: FC = () => {
  const {userAccounts} = useContext(UserAccountContext)
  const [isSwitchAccountVisible, setSwitchAccountVisible] = useState(false)

  const activeAcctName =
    userAccounts && userAccounts.filter(acct => acct.isActive)[0].name

  const showSwitchAccountDialog = () => {
    setSwitchAccountVisible(true)
  }

  const closeSwitchAccountDialog = () => {
    setSwitchAccountVisible(false)
  }

  return (
    <Page titleTag={pageTitleSuffixer(['About', 'Account'])}>
      <AccountTabContainer activeTab="about">
        <>
          {userAccounts && userAccounts.length >= 2 && (
            <Button
              text="Switch Account"
              icon={IconFont.Switch_New}
              onClick={showSwitchAccountDialog}
              testID="user-account-switch-btn"
            />
          )}
          <hr />
          <h2 data-testid="account-settings--header"> Account Details </h2>
          <div data-testid="account-active-name--block">
            Currently logged in Active Account: {activeAcctName}
          </div>

          <Overlay visible={isSwitchAccountVisible}>
            <SwitchAccountOverlay onDismissOverlay={closeSwitchAccountDialog} />
          </Overlay>
        </>
      </AccountTabContainer>
    </Page>
  )
}

const AccountPage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Account Settings Page'])}>
      <UserAccountProvider>
        <AccountAboutPage />
      </UserAccountProvider>
    </Page>
  )
}

export default AccountPage

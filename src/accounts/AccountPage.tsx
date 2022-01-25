// Libraries
import React, {FC, useContext, useState, useEffect} from 'react'
import {
  Button,
  ComponentSize,
  IconFont,
  Input,
  InputType,
  Overlay,
  Page,
} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {UserAccountProvider} from 'src/accounts/context/userAccount'
import AccountTabContainer from 'src/accounts/AccountTabContainer'

import {UserAccountContext} from 'src/accounts/context/userAccount'

import {SwitchAccountOverlay} from 'src/accounts/SwitchAccountOverlay'

const AccountAboutPage: FC = () => {
  const {userAccounts, handleRenameActiveAccount} = useContext(
    UserAccountContext
  )
  const [isSwitchAccountVisible, setSwitchAccountVisible] = useState(false)

  /**
   * confirmed with @Grace and @distortia that there is guaranteed
   * to be at least one account (since the user has to be logged in
   * to get to this call); and each account is guaranteed to have a name.
   *
   * and one of the accounts has to be active (the one that the user currently
   * is logged in as)
   */
  const activeAccount =
    userAccounts && userAccounts.filter(acct => acct.isActive)[0]
  const [activeAcctName, setActiveAcctName] = useState(activeAccount?.name)

  console.log('active acct name?', activeAcctName)

  useEffect(() => {
    setActiveAcctName(activeAccount?.name)
  }, [activeAccount])

  const updateAcctName = evt => {
    setActiveAcctName(evt.target.value)
  }

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
            <React.Fragment>
              <Button
                text="Switch Account"
                icon={IconFont.Switch_New}
                onClick={showSwitchAccountDialog}
                testID="user-account-switch-btn"
              />
              <hr />
            </React.Fragment>
          )}

          <h2 data-testid="account-settings--header"> Account Details </h2>
          <div data-testid="account-active-name--block">
            Currently logged in Active Account: {activeAccount?.name}
          </div>
          <Input
            name="accountName"
            testID="input--active-account-name"
            type={InputType.Text}
            value={activeAcctName}
            onChange={updateAcctName}
            size={ComponentSize.Medium}
          />
          <Button
            onClick={() =>
              handleRenameActiveAccount(activeAccount.id, activeAcctName)
            }
            text="Update ME (ACK ACK ACK NO BRUNO!)"
          />

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

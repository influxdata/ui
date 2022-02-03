// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
import {
  Button,
  ComponentSize,
  FlexBox,
  FlexDirection,
  IconFont,
  Input,
  InputType,
  Overlay,
  Page,
} from '@influxdata/clockface'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {
  UserAccountContext,
  UserAccountProvider,
} from 'src/accounts/context/userAccount'
import AccountTabContainer from 'src/accounts/AccountTabContainer'
import AccountHeader from 'src/accounts/AccountHeader'

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
   *
   * but note that at first load, the accounts may not be loaded yet.  hence, the useEffect
   * to re-initialize the activeAcctName
   */
  const activeAccount =
    userAccounts && userAccounts.filter(acct => acct.isActive)[0]
  const [activeAcctName, setActiveAcctName] = useState(activeAccount?.name)

  // needed b/c the context updates the page once the active accts are loaded
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

  const inputStyle = {width: 250}
  const labelStyle = {marginBottom: 8}

  return (
    <AccountTabContainer activeTab="about">
      <>
        {userAccounts && userAccounts.length >= 2 && (
          <div>
            <Button
              text="Switch Account"
              icon={IconFont.Switch_New}
              onClick={showSwitchAccountDialog}
              testID="user-account-switch-btn"
            />
            <hr style={{marginTop: '32px'}} />
          </div>
        )}

        <h4 data-testid="account-settings--header"> Account Details </h4>
        <div style={labelStyle}>Account Name</div>
        <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Medium}>
          <Input
            name="accountName"
            testID="input--active-account-name"
            type={InputType.Text}
            value={activeAcctName}
            onChange={updateAcctName}
            size={ComponentSize.Medium}
            style={inputStyle}
          />
          <Button
            onClick={() =>
              handleRenameActiveAccount(activeAccount.id, activeAcctName)
            }
            testID="rename-account--button"
            text="Save"
          />
        </FlexBox>
        <Overlay visible={isSwitchAccountVisible}>
          <SwitchAccountOverlay onDismissOverlay={closeSwitchAccountDialog} />
        </Overlay>
      </>
    </AccountTabContainer>
  )
}

const AccountPage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Account Settings Page'])}>
      <AccountHeader testID="account-page--header" />
      <UserAccountProvider>
        <AccountAboutPage />
      </UserAccountProvider>
    </Page>
  )
}

export default AccountPage

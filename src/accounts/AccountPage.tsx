// Libraries
import React, {ChangeEvent, FC, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {Switch, Route} from 'react-router-dom'

import {
  Button,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Input,
  InputType,
  Overlay,
  Page,
} from '@influxdata/clockface'
import {LeaveOrgButton} from 'src/organizations/components/OrgProfileTab/LeaveOrg'

// Context
import {UsersContext, UsersProvider} from 'src/users/context/users'
import {DeleteFreeAccountButton} from 'src/accounts/DeleteFreeAccount'
import {DeleteFreeAccountOverlay} from 'src/accounts/DeleteFreeAccountOverlay'

// Selectors
import {selectCurrentIdentity} from 'src/identity/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {UserAccountContext} from 'src/accounts/context/userAccount'
import AccountTabContainer from 'src/accounts/AccountTabContainer'
import AccountHeader from 'src/accounts/AccountHeader'
import {DeleteFreeAccountProvider} from 'src/accounts/context/DeleteFreeAccountContext'

import CancellationOverlay from './CancellationOverlay'
import CancelServiceProvider from 'src/billing/components/PayAsYouGo/CancelServiceContext'

// Styles
import './AccountPageStyles.scss'

const AccountAboutPage: FC = () => {
  const {userAccounts, handleRenameActiveAccount} =
    useContext(UserAccountContext)

  const {users} = useContext(UsersContext)

  const [isDeactivateAccountVisible, setDeactivateAccountVisible] =
    useState(false)

  const activeAccount =
    userAccounts && userAccounts.filter(acct => acct.isActive)[0]
  const [activeAcctName, setActiveAcctName] = useState(activeAccount?.name)

  // needed b/c the context updates the page once the active accts are loaded
  useEffect(() => {
    setActiveAcctName(activeAccount?.name)
  }, [activeAccount])

  const {user, account} = useSelector(selectCurrentIdentity)

  const updateAcctName = (evt: ChangeEvent<HTMLInputElement>) => {
    setActiveAcctName(evt.target.value)
  }

  const showDeactivateAccountOverlay = () => {
    setDeactivateAccountVisible(true)
  }

  const hideDeactivateAccountOverlay = () => {
    setDeactivateAccountVisible(false)
  }

  const onRenameAccountBtnClick = () => {
    handleRenameActiveAccount(activeAccount.id, activeAcctName)
  }
  const shouldShowDeleteFreeAccountButton =
    CLOUD && account.type === 'free' && user.orgCount === 1

  const showDeactivateAccountSection = isFlagEnabled('freeAccountCancellation')
  const showLeaveOrgButton = !isFlagEnabled('createDeleteOrgs')
  const allowSelfRemoval = users.length > 1

  return (
    <AccountTabContainer activeTab="settings">
      <>
        <h4
          data-testid="account-settings--header"
          className="account-settings--header"
        >
          Account Details
        </h4>
        <div className="account-settings--account-name">Account Name</div>
        <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Medium}>
          <Input
            name="accountName"
            testID="input--active-account-name"
            className="account-settings--name-input"
            type={InputType.Text}
            value={activeAcctName}
            onChange={updateAcctName}
            size={ComponentSize.Medium}
          />
          <Button
            onClick={onRenameAccountBtnClick}
            testID="rename-account--button"
            text="Save"
          />
        </FlexBox>
        {allowSelfRemoval && showLeaveOrgButton && (
          <>
            <hr className="account-settings--divider" />
            <LeaveOrgButton />
          </>
        )}
        {showDeactivateAccountSection && (
          <>
            <hr className="account-settings--divider" />
            <h4
              data-testid="account-settings--header"
              className="account-settings--header"
            >
              Deactivate Account
            </h4>
            <div className="account-settings--deactivate-description">
              If you decide to deactivate this account, all your writes,
              queries, and tasks will be suspended immediately.
            </div>
            <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Large}>
              <Button
                className="account-settings--deactivate-button"
                onClick={showDeactivateAccountOverlay}
                testID="deactivate-account--button"
                text="DEACTIVATE ACCOUNT"
              />
            </FlexBox>
          </>
        )}
        <CancelServiceProvider>
          <Overlay visible={isDeactivateAccountVisible}>
            <CancellationOverlay onHideOverlay={hideDeactivateAccountOverlay} />
          </Overlay>
        </CancelServiceProvider>
        {shouldShowDeleteFreeAccountButton && <DeleteFreeAccountButton />}
      </>
    </AccountTabContainer>
  )
}

const AccountPage: FC = () => {
  const {account} = useSelector(selectCurrentIdentity)

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Account Settings Page'])}>
        <AccountHeader testID="account-page--header" />
        <UsersProvider>
          <AccountAboutPage />
        </UsersProvider>
      </Page>
      <Switch>
        {CLOUD && account.type === 'free' && (
          <DeleteFreeAccountProvider>
            <Route
              path="/orgs/:orgID/accounts/settings/delete"
              component={DeleteFreeAccountOverlay}
            />
          </DeleteFreeAccountProvider>
        )}
      </Switch>
    </>
  )
}

export default AccountPage

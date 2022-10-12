// Libraries
import React, {ChangeEvent, FC, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import {
  Button,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  FlexDirection,
  Input,
  InputType,
  Overlay,
  Page,
} from '@influxdata/clockface'

import {getMe} from 'src/me/selectors'
import {UsersContext, UsersProvider} from 'src/users/context/users'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {UserAccountContext} from 'src/accounts/context/userAccount'
import AccountTabContainer from 'src/accounts/AccountTabContainer'
import AccountHeader from 'src/accounts/AccountHeader'

import CancellationOverlay from './CancellationOverlay'
import CancelServiceProvider from 'src/billing/components/PayAsYouGo/CancelServiceContext'

// Styles
import './AccountPageStyles.scss'
import {CLOUD_URL} from 'src/shared/constants'

const leaveBtnStyle = {
  width: 'auto',
  marginTop: 32,
  paddingLeft: '8px',
  paddingRight: '8px',
}

const AccountAboutPage: FC = () => {
  const {userAccounts, handleRenameActiveAccount} =
    useContext(UserAccountContext)
  const {users, handleRemoveUser} = useContext(UsersContext)

  const [isDeactivateAccountVisible, setDeactivateAccountVisible] =
    useState(false)

  const activeAccount =
    userAccounts && userAccounts.filter(acct => acct.isActive)[0]
  const [activeAcctName, setActiveAcctName] = useState(activeAccount?.name)

  // needed b/c the context updates the page once the active accts are loaded
  useEffect(() => {
    setActiveAcctName(activeAccount?.name)
  }, [activeAccount])

  const updateAcctName = (evt: ChangeEvent<HTMLInputElement>) => {
    setActiveAcctName(evt.target.value)
  }

  const currentUserId = useSelector(getMe)?.id

  const handleRemove = () => {
    handleRemoveUser(currentUserId)
    window.location.href = CLOUD_URL
  }

  const allowSelfRemoval = users.length > 1

  const leaveAcctBtn = (
    <ConfirmationButton
      confirmationLabel="This action will remove yourself from accessing this organization"
      confirmationButtonText="Leave Account"
      titleText="Leave Account"
      text="Leave Account"
      confirmationButtonColor={ComponentColor.Danger}
      color={ComponentColor.Default}
      shape={ButtonShape.Square}
      onConfirm={handleRemove}
      testID="delete-user"
      style={leaveBtnStyle}
    />
  )

  const inputStyle = {width: 250}
  const labelStyle = {marginBottom: 8, maxWidth: '500px'}
  const dividerStyle = {marginTop: '32px', maxWidth: '500px'}
  const actionButtonStyle = {marginTop: '24px'}

  const showDeactivateAccountOverlay = () => {
    setDeactivateAccountVisible(true)
  }

  const hideDeactivateAccountOverlay = () => {
    setDeactivateAccountVisible(false)
  }

  const onRenameAccountBtnClick = () => {
    handleRenameActiveAccount(activeAccount.id, activeAcctName)
  }

  const showDeactivateAccountSection = isFlagEnabled('freeAccountCancellation')

  return (
    <AccountTabContainer activeTab="about">
      <>
        <h4
          data-testid="account-settings--header"
          className="account-settings--header"
        >
          Account Details
        </h4>
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
            onClick={onRenameAccountBtnClick}
            testID="rename-account--button"
            text="Save"
          />
        </FlexBox>
        {allowSelfRemoval && leaveAcctBtn}
        {showDeactivateAccountSection && (
          <>
            <hr style={dividerStyle} />
            <h4
              data-testid="account-settings--header"
              className="account-settings--header"
            >
              Deactivate Account
            </h4>
            <div style={labelStyle}>
              If you decide to deactivate this account, all your writes,
              queries, and tasks will be suspended immediately.
            </div>
            <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Large}>
              <Button
                onClick={showDeactivateAccountOverlay}
                testID="deactivate-account--button"
                text="DEACTIVATE ACCOUNT"
                style={actionButtonStyle}
              />
            </FlexBox>
          </>
        )}
        <CancelServiceProvider>
          <Overlay visible={isDeactivateAccountVisible}>
            <CancellationOverlay onHideOverlay={hideDeactivateAccountOverlay} />
          </Overlay>
        </CancelServiceProvider>
      </>
    </AccountTabContainer>
  )
}

const AccountPage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Account Settings Page'])}>
      <AccountHeader testID="account-page--header" />
      <UsersProvider>
        <AccountAboutPage />
      </UsersProvider>
    </Page>
  )
}

export default AccountPage

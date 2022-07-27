// Libraries
import React, {FC, useEffect, useState, useMemo, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  FontWeight,
  JustifyContent,
  Heading,
  HeadingElement,
  ButtonType,
} from '@influxdata/clockface'

// Selectors and Context
import {UserAccountContext} from 'src/accounts/context/userAccount'
import {selectQuartzIdentity, selectQuartzOrgs} from 'src/identity/selectors'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  orgDefaultSettingError,
  orgDefaultSettingSuccess,
} from 'src/shared/copy/notifications'

// Thunks
import {updateDefaultOrgThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Components
import {DefaultDropdown} from 'src/identity/components/userprofile/DefaultDropdown'
import LabeledUserData from 'src/identity/components/userprofile/LabeledUserData'

// Constants
import {
  emptyAccount,
  emptyOrg,
} from 'src/identity/components/GlobalHeader/DefaultEntities'

// Types
import {EntityLabel} from 'src/identity/components/userprofile/DefaultDropdown'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

export const UserDefaults: FC = () => {
  const dispatch = useDispatch()

  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const identity = useSelector(selectQuartzIdentity)
  const quartzOrganizations = useSelector(selectQuartzOrgs)

  const accounts = userAccounts
  const orgs = quartzOrganizations.orgs

  const loggedInAccount = identity.currentIdentity.account

  const currentDefaultAccount = useMemo(
    () =>
      accounts ? accounts.find(el => el.isDefault === true) : emptyAccount,
    [accounts]
  )
  const currentDefaultOrg = useMemo(
    () => (orgs ? orgs.find(el => el.isDefault === true) : emptyOrg),
    [orgs]
  )

  const [newDefaultAccount, setNewDefaultAccount] = useState(
    currentDefaultAccount
  )
  const [newDefaultOrg, setNewDefaultOrg] = useState(currentDefaultOrg)

  useEffect(() => {
    setNewDefaultAccount(currentDefaultAccount)
  }, [accounts, currentDefaultAccount])

  useEffect(() => {
    setNewDefaultOrg(currentDefaultOrg)
  }, [orgs, currentDefaultOrg])

  const selectedNewAccount =
    currentDefaultAccount?.id !== newDefaultAccount?.id &&
    newDefaultAccount !== null

  const selectedNewOrg =
    currentDefaultOrg?.id !== newDefaultOrg?.id && newDefaultOrg !== null
  console.log('new org?')
  console.log(selectedNewOrg)
  console.log('currentDefaultOrg')
  console.log(currentDefaultOrg)
  console.log('newDefaultOrg')
  console.log(newDefaultOrg)

  const saveButtonStatus =
    selectedNewAccount || selectedNewOrg
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  const saveButtonColor =
    selectedNewAccount || selectedNewOrg
      ? ComponentColor.Primary
      : ComponentColor.Secondary

  const handleChangeDefaults = () => {
    if (selectedNewAccount) {
      handleSetDefaultAccount(newDefaultAccount.id)
    }
    if (selectedNewOrg) {
      try {
        dispatch(
          updateDefaultOrgThunk({accountId: loggedInAccount.id, newDefaultOrg})
        )
        dispatch(notify(orgDefaultSettingSuccess(newDefaultOrg.name)))
      } catch {
        dispatch(notify(orgDefaultSettingError(newDefaultOrg.name)))
      }
    }
  }

  return (
    <>
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        <Heading
          weight={FontWeight.Bold}
          element={HeadingElement.H4}
          className="change-account-org-container--header"
        >
          Default Account
        </Heading>
        <div className="change-account-org-container--text">
          Select the account you want to see by default when you first log in
        </div>
        {accounts && (
          <DefaultDropdown
            entityLabel={EntityLabel.DefaultAccount}
            defaultEntity={newDefaultAccount}
            entityList={accounts}
            changeSelectedEntity={setNewDefaultAccount}
          />
        )}
      </FlexBox>
      <br />
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        <Heading
          weight={FontWeight.Bold}
          element={HeadingElement.H4}
          className="change-account-org-container--header"
        >
          Default Organization
        </Heading>
        <div className="change-account-org-container--text">
          Select the organization you want to see by default when logging into
          your current account
        </div>
      </FlexBox>
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        {accounts && (
          <LabeledUserData
            label="Current Account"
            data={loggedInAccount.name}
          />
        )}
        {orgs && (
          <DefaultDropdown
            entityLabel={EntityLabel.DefaultOrg}
            defaultEntity={newDefaultOrg}
            entityList={orgs}
            changeSelectedEntity={setNewDefaultOrg}
          />
        )}
      </FlexBox>
      <Button
        text="Save Changes"
        titleText="Save the currently selected account and organization as defaults"
        disabledTitleText="Select a new default account or organization to save your preferences."
        status={saveButtonStatus}
        color={saveButtonColor}
        onClick={handleChangeDefaults}
        size={ComponentSize.Small}
        type={ButtonType.Submit}
        className="user-profile-page--save-button"
        testID="user-profile-page--save"
      />
    </>
  )
}

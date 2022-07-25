// Libraries
import React, {FC, useEffect, useState, useMemo, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  AlignItems,
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  FontWeight,
  JustifyContent,
  Heading,
  HeadingElement,
} from '@influxdata/clockface'

// Selectors and Context
import {UserAccountContext} from 'src/accounts/context/userAccount'
import {selectQuartzOrgs} from 'src/identity/selectors'

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
  // When component is first loaded, pick whichver account the user is currently logged in
  // Then fetch a list of all of the orgs associated with that account

  // Whenever you click the user menu

  const dispatch = useDispatch()

  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const quartzOrganizations = useSelector(selectQuartzOrgs)

  const accounts = userAccounts
  const orgs = quartzOrganizations.orgs

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
        dispatch(updateDefaultOrgThunk(currentDefaultOrg, newDefaultOrg))
        dispatch(notify(orgDefaultSettingSuccess(newDefaultOrg.name)))
      } catch {
        dispatch(notify(orgDefaultSettingError(newDefaultOrg.name)))
      }
    }
  }

  return (
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
        Default Account and Organization
      </Heading>
      <div className="change-account-org-container--text">
        The account and organization you'll see when you login
      </div>
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        {accounts && (
          <DefaultDropdown
            entityLabel={EntityLabel.SetDefaultAccount}
            defaultEntity={currentDefaultAccount}
            entityList={accounts}
            changeSelectedEntity={setNewDefaultAccount}
          />
        )}
        <Button
          status={saveButtonStatus}
          type={ButtonType.Submit}
          color={saveButtonColor}
          text="Save"
          size={ComponentSize.Small}
          testID="save-defaultaccountorg--button"
          onClick={handleChangeDefaults}
          className="change-account-org-container--button"
        />
      </FlexBox>
      <br /> <br />
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        {accounts && (
          <DefaultDropdown
            entityLabel={EntityLabel.SelectAccount}
            defaultEntity={currentDefaultAccount}
            entityList={accounts}
            changeSelectedEntity={setNewDefaultAccount}
          />
        )}
        {orgs && (
          <DefaultDropdown
            entityLabel={EntityLabel.SetDefaultOrg}
            defaultEntity={currentDefaultOrg}
            entityList={orgs}
            changeSelectedEntity={setNewDefaultOrg}
          />
        )}
        <Button
          status={saveButtonStatus}
          type={ButtonType.Submit}
          color={saveButtonColor}
          text="Save"
          size={ComponentSize.Small}
          testID="save-defaultaccountorg--button"
          onClick={handleChangeDefaults}
          className="change-account-org-container--button"
        />
      </FlexBox>
    </FlexBox>
  )
}

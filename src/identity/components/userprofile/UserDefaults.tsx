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
  const dispatch = useDispatch()

  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const quartzOrganizations = useSelector(selectQuartzOrgs)

  const accounts = userAccounts
  const orgs = quartzOrganizations.orgs

  const defaultAccount = useMemo(
    () =>
      accounts ? accounts.find(el => el.isDefault === true) : emptyAccount,
    [accounts]
  )
  const defaultOrg = useMemo(
    () => (orgs ? orgs.find(el => el.isDefault === true) : emptyOrg),
    [orgs]
  )

  const [selectedAccount, changeSelectedAccount] = useState(defaultAccount)
  const [selectedOrg, changeSelectedOrg] = useState(defaultOrg)

  useEffect(() => {
    changeSelectedAccount(defaultAccount)
  }, [accounts, defaultAccount])

  useEffect(() => {
    changeSelectedOrg(defaultOrg)
  }, [orgs, defaultOrg])

  const selectedNewAccount =
    defaultAccount?.id !== selectedAccount?.id && selectedAccount !== null

  const selectedNewOrg =
    defaultOrg?.id !== selectedOrg?.id && selectedOrg !== null

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
      handleSetDefaultAccount(selectedAccount.id)
    }
    if (selectedNewOrg) {
      try {
        dispatch(updateDefaultOrgThunk(defaultOrg, selectedOrg))
        dispatch(notify(orgDefaultSettingSuccess(selectedOrg.name)))
      } catch {
        dispatch(notify(orgDefaultSettingError(selectedOrg.name)))
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
            entityLabel={EntityLabel.Account}
            defaultEntity={defaultAccount}
            entityList={accounts}
            changeSelectedEntity={changeSelectedAccount}
          />
        )}
        {orgs && (
          <DefaultDropdown
            entityLabel={EntityLabel.Org}
            defaultEntity={defaultOrg}
            entityList={orgs}
            changeSelectedEntity={changeSelectedOrg}
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

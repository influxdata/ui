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
  Form,
  JustifyContent,
  Heading,
  HeadingElement,
} from '@influxdata/clockface'

// Selectors and Context
import {UserAccountContext} from 'src/accounts/context/userAccount'
import {selectQuartzIdentity, selectQuartzOrgs} from 'src/identity/selectors'

// Thunks
import {updateDefaultOrgThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Components
import {DefaultDropdown} from 'src/identity/components/userprofile/DefaultDropdown'
import {UserProfileInput} from 'src/identity/components/userprofile/UserProfileInput'

// Constants
import {
  emptyAccount,
  emptyOrg,
} from 'src/identity/components/GlobalHeader/DefaultEntities'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  orgDefaultSetFailure,
  orgDefaultSetSuccess,
} from 'src/shared/copy/notifications'

// Types
import {EntityLabel} from 'src/identity/components/userprofile/DefaultDropdown'
import {ThunkErrorNames} from 'src/identity/quartzOrganizations/actions/thunks'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

export const UserDefaults: FC = () => {
  const dispatch = useDispatch()

  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const quartzOrganizations = useSelector(selectQuartzOrgs)

  const identity = useSelector(selectQuartzIdentity)
  const loggedInAccount = identity.currentIdentity.account

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

  const [selectedAccount, setSelectedAccount] = useState(defaultAccount)
  const [selectedOrg, setSelectedOrg] = useState(defaultOrg)

  useEffect(() => {
    setSelectedAccount(defaultAccount)
  }, [accounts, defaultAccount])

  useEffect(() => {
    setSelectedOrg(defaultOrg)
  }, [orgs, defaultOrg])

  const selectedNewAccount =
    defaultAccount?.id !== selectedAccount?.id && selectedAccount !== null

  const selectedNewOrg =
    defaultOrg?.id !== selectedOrg?.id && selectedOrg !== null

  const saveButtonStatus =
    selectedNewAccount || selectedNewOrg
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  const handleChangeDefaults = async () => {
    const notificationParams = {
      orgName: selectedOrg.name,
      accountName: loggedInAccount.name,
    }

    if (selectedNewAccount) {
      handleSetDefaultAccount(selectedAccount.id)
    }
    if (selectedNewOrg) {
      try {
        await dispatch(
          updateDefaultOrgThunk({
            accountId: loggedInAccount.id,
            newDefaultOrg: selectedOrg,
          })
        )
        dispatch(notify(orgDefaultSetSuccess(notificationParams)))
      } catch (err) {
        dispatch(notify(orgDefaultSetFailure(notificationParams)))
      }
    }
  }

  return (
    <Form>
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        <Heading
          weight={FontWeight.Bold}
          element={HeadingElement.H4}
          className="change-default-account-org--header"
        >
          Default Account
        </Heading>
        <div className="change-default-account-org--text">
          Select the account you want to see by default when you first log in
        </div>
        {accounts && (
          <DefaultDropdown
            entityLabel={EntityLabel.DefaultAccount}
            defaultEntity={selectedAccount}
            entityList={accounts}
            changeSelectedEntity={setSelectedAccount}
          />
        )}
      </FlexBox>

      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        <Heading
          weight={FontWeight.Bold}
          element={HeadingElement.H4}
          className="change-default-account-org--header"
        >
          Default Organization
        </Heading>
        <div className="change-default-account-org--text">
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
          <UserProfileInput
            status={ComponentStatus.Disabled}
            header="Account"
            text={loggedInAccount.name}
          />
        )}
        {orgs && (
          <DefaultDropdown
            entityLabel={EntityLabel.DefaultOrg}
            defaultEntity={selectedOrg}
            entityList={orgs}
            changeSelectedEntity={setSelectedOrg}
          />
        )}
      </FlexBox>

      <Button
        text="Save Changes"
        titleText="Save the currently selected account and organization as defaults"
        disabledTitleText="Select a new default account or organization to save your preferences."
        status={saveButtonStatus}
        color={ComponentColor.Primary}
        onClick={handleChangeDefaults}
        size={ComponentSize.Small}
        type={ButtonType.Submit}
        className="user-profile-page--save-button"
      />
    </Form>
  )
}

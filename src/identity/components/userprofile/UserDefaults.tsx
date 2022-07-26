// Libraries
import React, {
  FC,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useContext,
} from 'react'
import {useDispatch} from 'react-redux'
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
import {fetchOrgsByAccountID} from 'src/identity/apis/auth'

export const UserDefaults: FC = () => {
  const dispatch = useDispatch()

  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const accounts = userAccounts
  const [orgs, updateOrgs] = useState([emptyOrg])

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

  // This is temp and kind of hacky
  useEffect(() => {
    setNewDefaultAccount(currentDefaultAccount)
  }, [currentDefaultAccount])

  useEffect(() => {
    setNewDefaultOrg(currentDefaultOrg)
  }, [orgs, currentDefaultOrg])

  useEffect(() => {
    const fetchOrgs = async (accountId: number) => {
      const newOrgs = await fetchOrgsByAccountID(accountId)
      updateOrgs(newOrgs)
    }

    console.log('here is the empty account id')
    console.log(emptyAccount.id)
    console.log('here is the new default account id')
    console.log(newDefaultAccount.id)

    // newDefaultAccount id is the currentAccount id by default
    // current Account id is just '0' because it's the empty account id by default
    // is this a good design at all? should we be making states depenednt on other states instead of
    // directly dependent on base state?

    if (newDefaultAccount.id === 0) {
      // if it's zero, dont do anything yet
    } else if (newDefaultAccount.id === currentDefaultAccount.id) {
      fetchOrgs(currentDefaultAccount.id)
    } else {
      fetchOrgs(newDefaultAccount.id)
    }
  }, [newDefaultAccount, currentDefaultAccount])

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
        dispatch(
          updateDefaultOrgThunk({
            accountId: newDefaultAccount.id,
            newDefaultOrg: newDefaultOrg,
          })
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
          Select the account you want to see when you first log in
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
          Select the organization you want to see when you switch to this
          account
        </div>
      </FlexBox>
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        {accounts && (
          <LabeledUserData label="Account" data={newDefaultAccount.name} />
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
        text="Save"
        titleText="Save the currently selected account and organization as defaults"
        disabledTitleText="Select a new default account or organization to save your preferences."
        status={saveButtonStatus}
        color={saveButtonColor}
        onClick={handleChangeDefaults}
        size={ComponentSize.Small}
        type={ButtonType.Submit}
        testID="user-profile-page--save-button"
      />
    </>
  )
}

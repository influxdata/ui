// Libraries
import React, {FC, useEffect, useState, useMemo, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
} from '@influxdata/clockface'

// Selectors and Context
import {UserAccountContext} from 'src/accounts/context/userAccount'
import {selectQuartzIdentity, selectQuartzOrgs} from 'src/identity/selectors'

// Thunks
import {updateDefaultOrgThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Components
import {DefaultAccountForm} from 'src/identity/components/userprofile/DefaultAccountForm'
import {DefaultOrgForm} from 'src/identity/components/userprofile/DefaultOrgForm'

// Constants
import {
  emptyAccount,
  emptyOrg,
} from 'src/identity/components/GlobalHeader/DefaultEntities'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  userProfileSaveError,
  userProfileSaveSuccess,
} from 'src/shared/copy/notifications'

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

  const userChangedPrefs = selectedNewAccount || selectedNewOrg

  const saveButtonStatus =
    selectedNewAccount || selectedNewOrg
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  const handleChangeDefaults = async () => {
    if (userChangedPrefs) {
      try {
        if (selectedNewAccount) {
          await handleSetDefaultAccount(selectedAccount.id, {
            disablePopUps: true,
          })
        }

        if (selectedNewOrg) {
          await dispatch(
            updateDefaultOrgThunk({
              accountId: loggedInAccount.id,
              newDefaultOrg: selectedOrg,
            })
          )
        }

        dispatch(notify(userProfileSaveSuccess()))
      } catch (err) {
        dispatch(notify(userProfileSaveError()))
      }
    }
  }

  return (
    <Form>
      <DefaultAccountForm
        accounts={accounts}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
      />

      <DefaultOrgForm
        accounts={accounts}
        loggedInAccount={loggedInAccount}
        orgs={orgs}
        selectedOrg={selectedOrg}
        setSelectedOrg={setSelectedOrg}
      />

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

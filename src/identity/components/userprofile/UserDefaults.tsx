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

// Eventing
import {
  multiOrgEvent,
  UserProfileEvent,
} from 'src/identity/events/multiOrgEvents'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

export const UserDefaults: FC = () => {
  const dispatch = useDispatch()

  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const quartzOrganizations = useSelector(selectQuartzOrgs)

  const identity = useSelector(selectQuartzIdentity)
  const loggedInAccount = identity.currentIdentity.account

  const accounts = userAccounts
  const numAccounts = userAccounts ? userAccounts.length : 0

  const orgs = quartzOrganizations.orgs
  const numOrgs = quartzOrganizations.orgs ? quartzOrganizations.orgs.length : 0

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

  const userPickedNewAccount =
    defaultAccount?.id !== selectedAccount?.id && selectedAccount !== null

  const userPickedNewOrg =
    defaultOrg?.id !== selectedOrg?.id && selectedOrg !== null

  const userChangedPrefs = userPickedNewAccount || userPickedNewOrg

  const saveButtonStatus = userChangedPrefs
    ? ComponentStatus.Default
    : ComponentStatus.Disabled

  const handleChangeDefaults = async () => {
    if (userChangedPrefs) {
      try {
        if (userPickedNewAccount) {
          multiOrgEvent(UserProfileEvent.DefaultAccountChange, {
            oldDefaultAccountID: loggedInAccount.id,
            oldDefaultAccountName: loggedInAccount.name,
            newDefaultAccountID: selectedAccount.id,
            newDefaultAccountName: selectedAccount.name,
          })

          await handleSetDefaultAccount(selectedAccount.id, {
            disablePopUps: true,
          })
        }

        if (userPickedNewOrg) {
          multiOrgEvent(UserProfileEvent.DefaultOrgChange, {
            oldDefaultOrgID: defaultOrg.id,
            oldDefaultOrgName: defaultOrg.name,
            newDefaultOrgID: selectedOrg.id,
            newDefaultOrgName: selectedOrg.name,
          })

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
    (numAccounts > 1 || numOrgs > 1) && (
      <Form>
        {numAccounts > 1 && (
          <DefaultAccountForm
            accounts={accounts}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
          />
        )}

        {numOrgs > 1 && (
          <DefaultOrgForm
            accounts={accounts}
            loggedInAccount={loggedInAccount}
            orgs={orgs}
            selectedOrg={selectedOrg}
            setSelectedOrg={setSelectedOrg}
          />
        )}

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
          testID="user-profile--save-button"
        />
      </Form>
    )
  )
}

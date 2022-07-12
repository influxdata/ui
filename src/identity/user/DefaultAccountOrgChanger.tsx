import React, {FC, useEffect, useState, useMemo, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {UserAccountContext} from 'src/accounts/context/userAccount'
import {selectQuartzOrgs} from '../selectors'
import {notify} from 'src/shared/actions/notifications'
import {
  orgDefaultSettingError,
  orgDefaultSettingSuccess,
} from 'src/shared/copy/notifications'

import {
  Heading,
  FlexBox,
  FlexDirection,
  AlignItems,
  JustifyContent,
  HeadingElement,
  Button,
  ComponentStatus,
  FontWeight,
  ButtonType,
  ComponentColor,
  ComponentSize,
  InfluxColors,
} from '@influxdata/clockface'
import {DefaultAccountDropDown} from './DefaultAccountDropdown'
import {DefaultOrgDropDown} from './DefaultOrgDropDown'

import {updateDefaultOrgThunk} from '../quartzOrganizations/actions/thunks'
import {
  emptyAccount,
  emptyOrg,
} from '../components/GlobalHeader/DefaultEntities'

export const DefaultAccountOrgChanger: FC = () => {
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
  const selectedNewAccount =
    defaultAccount?.id !== selectedAccount?.id && selectedAccount !== null

  useEffect(() => {
    changeSelectedOrg(defaultOrg)
  }, [orgs, defaultOrg])
  const selectedNewOrg =
    defaultOrg?.id !== selectedOrg?.id && selectedOrg !== null

  const saveButtonStatus =
    selectedNewAccount || selectedNewOrg
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  // The account update may be due for a refactor after this button is removed on the accounts page.
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

  const sixtyPercentWidth = {width: '60%'}
  const buttonAlignment = {
    marginLeft: '20px',
    alignSelf: 'flex-end',
    justifySelf: 'flex-end',
  }

  return (
    <>
      <Heading
        weight={FontWeight.Bold}
        element={HeadingElement.H3}
        style={{marginTop: '20px', marginBottom: '10px'}}
      >
        Default Account and Organization
      </Heading>
      <div style={{color: InfluxColors.Grey65}}>
        The account and organization you'll see when you login
      </div>
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
        style={sixtyPercentWidth}
      >
        {accounts && (
          <DefaultAccountDropDown
            label="Default Account"
            defaultAccount={defaultAccount}
            changeSelectedAccount={changeSelectedAccount}
            accountList={accounts}
          />
        )}
        {orgs && (
          <DefaultOrgDropDown
            label="Default Organization"
            defaultOrg={defaultOrg}
            changeSelectedOrg={changeSelectedOrg}
            orgList={orgs}
          />
        )}
        <Button
          status={saveButtonStatus}
          type={ButtonType.Submit}
          color={ComponentColor.Default}
          text="Save"
          size={ComponentSize.Small}
          testID="save-defaultaccountorg--button"
          style={buttonAlignment}
          onClick={handleChangeDefaults}
        />
      </FlexBox>
    </>
  )
}

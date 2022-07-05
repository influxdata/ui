import React, {FC, useEffect, useState, useMemo, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {UserAccountContext} from 'src/accounts/context/userAccount'
import {selectQuartzOrgs} from '../selectors'

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
} from '@influxdata/clockface'
import {DefaultAccountDropDown} from './DefaultAccountDropdown'
import {DefaultOrgDropDown} from './DefaultOrgDropDown'

import {updateDefaultOrgThunk} from '../quartzOrganizations/actions/thunks'

export const DefaultAccountOrgChanger: FC = () => {
  const dispatch = useDispatch()
  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const quartzOrganizations = useSelector(selectQuartzOrgs)

  const accounts = userAccounts
  const defaultAccount = useMemo(
    () =>
      !accounts
        ? {id: 0, name: '', isDefault: true, isActive: true}
        : accounts.find(el => el.isDefault === true),
    [accounts]
  )
  const [selectedAccount, changeSelectedAccount] = useState(defaultAccount)
  useEffect(() => {
    changeSelectedAccount(defaultAccount)
  }, [accounts, defaultAccount])
  const selectedNewAccount =
    defaultAccount?.id !== selectedAccount?.id && selectedAccount !== null

  const orgs = quartzOrganizations.orgs
  const defaultOrg = useMemo(() => orgs.find(el => el.isDefault === true), [
    orgs,
  ])
  const [selectedOrg, changeSelectedOrg] = useState(defaultOrg)
  useEffect(() => {
    changeSelectedOrg(defaultOrg)
  }, [orgs, defaultOrg])
  const selectedNewOrg =
    defaultOrg?.id !== selectedOrg?.id && selectedOrg !== null

  const saveButtonStatus =
    selectedNewAccount || selectedNewOrg
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  const handleChangeDefaults = () => {
    if (selectedNewAccount) {
      handleSetDefaultAccount(selectedAccount.id)
    }
    if (selectedNewOrg) {
      dispatch(updateDefaultOrgThunk(defaultOrg, selectedOrg))
    }
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.FlexStart}
      justifyContent={JustifyContent.FlexStart}
      style={{width: '100%'}}
    >
      <br />
      <Heading weight={FontWeight.Bold} element={HeadingElement.H3}>
        Default Account and Organization
      </Heading>
      <br />
      The account and organization you'll see when you login
      <FlexBox
        direction={FlexDirection.Row}
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
        style={{width: '60%'}}
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
          style={{
            alignSelf: 'flex-end',
            justifySelf: 'flex-end',
          }}
          onClick={handleChangeDefaults}
        />
      </FlexBox>
    </FlexBox>
  )
}

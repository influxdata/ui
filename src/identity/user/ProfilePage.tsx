// Libraries
import React, {FC, useEffect, useContext, useState, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {UserAccountContext} from 'src/accounts/context/userAccount'

import {
  AlignItems,
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
  JustifyContent,
  Page,
} from '@influxdata/clockface'

// Components

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Constants
import {selectQuartzIdentity, selectQuartzOrgs} from 'src/identity/selectors'

// Styles
import './style.scss'

import LabeledData from './LabeledData'
import {DefaultAccountDropDown} from './DefaultAccountDropdown'
import {DefaultOrgDropDown} from './DefaultOrgDropDown'
import {ComponentStatus} from 'src/clockface'
import {updateDefaultOrgThunk} from '../quartzOrganizations/actions/thunks'

export const UserProfilePage: FC = () => {
  const dispatch = useDispatch()

  const identity = useSelector(selectQuartzIdentity)
  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)
  const orgsList = useSelector(selectQuartzOrgs).orgs

  const defaultOrg = useMemo(() => orgsList.find(el => el.isDefault === true), [
    orgsList,
  ])

  const defaultAccount = useMemo(
    () =>
      !userAccounts
        ? {id: 0, name: '', isDefault: true, isActive: true}
        : userAccounts.find(el => el.isDefault === true),
    [userAccounts]
  )

  // Would this be easier to handle if we just added a ref to the component in clockface?
  const [selectedOrg, changeSelectedOrg] = useState(defaultOrg)
  const [selectedAccount, changeSelectedAccount] = useState(defaultAccount)

  useEffect(() => {
    changeSelectedOrg(defaultOrg)
  }, [orgsList]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    changeSelectedAccount(defaultAccount)
  }, [userAccounts]) // eslint-disable-line react-hooks/exhaustive-deps

  // There's definitely a cleaner way tow rite this logic
  const saveButtonStatus =
    (defaultOrg !== selectedOrg || defaultAccount !== selectedAccount) &&
    selectedOrg !== null &&
    selectedAccount !== null
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

  console.log('selectedvalues')
  console.log(selectedOrg)
  console.log(selectedAccount)

  const handleChangeDefaults = () => {
    console.log('currently selected account')
    console.log(selectedAccount)
    console.log('currently selected org')
    console.log(selectedOrg)

    try {
      if (selectedAccount.id !== defaultAccount.id) {
        // try to update state on the server. hopefully this does both
        handleSetDefaultAccount(selectedAccount.id)
      } else {
        // Run that error message for situations where didn't change
        // or just notify user it hasn't changed
      }
    } catch (err) {
      // Dispatch some error notification here
    }

    try {
      if (selectedOrg.id !== defaultOrg.id) {
        // try to update state on the server
        // if it fails, don't change anything
        // if it succeeds, update the relevant state locally
        // unless we think there's some reason this would get out of sync with serv
        console.log('Trying to set new default org to ' + selectedOrg.name)

        // Maybe consider calling these oldDefaultOrg, newDefaultOrg
        dispatch(updateDefaultOrgThunk(defaultOrg, selectedOrg))
      }
    } catch (err) {
      // Dont do anything
    }
  }

  const fullWidth = {width: '100%'}
  const sixtyPercentWidth = {width: '60%'}
  const pageMargins = {marginLeft: '32px', marginTop: '3px'}

  return (
    <>
      <Page
        titleTag={pageTitleSuffixer(['Settings', 'Organization'])}
        style={pageMargins}
      >
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.FlexStart}
          justifyContent={JustifyContent.FlexStart}
          margin={ComponentSize.Medium}
          style={fullWidth}
        >
          {/* USER PROFILE */}

          <Heading weight={FontWeight.Bold} element={HeadingElement.H1}>
            User Profile
          </Heading>
          <FlexBox
            direction={FlexDirection.Column}
            style={fullWidth}
            alignItems={AlignItems.FlexStart}
          >
            <Heading weight={FontWeight.Bold} element={HeadingElement.H3}>
              User Details
            </Heading>
            <LabeledData
              label="Email"
              src={identity.currentIdentity.user.email}
            />

            <FlexBox
              direction={FlexDirection.Row}
              style={sixtyPercentWidth}
              alignItems={AlignItems.FlexStart}
              justifyContent={JustifyContent.FlexStart}
            >
              <LabeledData
                label="First name"
                src={identity.currentIdentity.user.firstName}
              />
              <LabeledData
                label="Last name"
                src={identity.currentIdentity.user.lastName}
              />
            </FlexBox>
          </FlexBox>
          {/* What is the difference between FlexBox.child and FlexBoxChild? */}
          <FlexBox
            direction={FlexDirection.Column}
            alignItems={AlignItems.FlexStart}
            justifyContent={JustifyContent.FlexStart}
            style={{width: '100%'}}
          >
            {/* Probably better way to do this than adding a BR /> */}
            <br />
            {/* DEFAULT ACCOUNT AND ORGANIZATION */}
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
              {userAccounts && (
                <DefaultAccountDropDown
                  label="Default Account"
                  defaultAccount={defaultAccount}
                  changeSelectedAccount={changeSelectedAccount}
                  accountList={userAccounts}
                />
              )}
              <DefaultOrgDropDown
                label="Default Organization"
                defaultOrg={defaultOrg}
                changeSelectedOrg={changeSelectedOrg}
                orgList={orgsList}
              />

              {/* Lets disable this button if nothing is changed yet */}
              <Button
                status={saveButtonStatus}
                type={ButtonType.Submit}
                color={ComponentColor.Default}
                text="Save"
                size={ComponentSize.Small}
                // status={saveStatus}
                testID="save-defaultaccountorg--button"
                style={{
                  alignSelf: 'flex-end',
                  justifySelf: 'flex-end',
                }}
                onClick={handleChangeDefaults}
              />
            </FlexBox>
          </FlexBox>
        </FlexBox>
      </Page>
    </>
  )
}

// Libraries
import React, {FC, useEffect, useContext, useState, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
// import {Switch, Route} from 'react-router-dom'
import {UserAccountContext} from 'src/accounts/context/userAccount'

// What does this page thing do?
import {
  AlignItems,
  AppWrapper,
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexBoxChild,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
  Input,
  JustifyContent,
  Page,
} from '@influxdata/clockface'

// Components
// import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'
// import OrgHeader from 'src/organizations/components/OrgHeader'
// import OrgProfileTab from 'src/organizations/components/OrgProfileTab'
// import RenameOrgOverlay from 'src/organizations/components/RenameOrgOverlay'
// import DeleteOrgOverlay from 'src/organizations/components/DeleteOrgOverlay'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
// import {getQuartzMe} from 'src/me/selectors'
// import DeleteOrgProvider from 'src/organizations/components/DeleteOrgContext'

// Constants
import {selectQuartzIdentity} from 'src/identity/selectors'
// Change name of this
import './style.scss'
import LabeledData from './LabeledData'
import {DefaultAccountDropDown} from './DefaultAccountDropdown'
import {DefaultOrgDropDown} from './DefaultOrgDropDown'
import {setDefaultOrg} from '../actions/creators'
import {updateDefaultOrgThunk} from '../actions/thunks'

export const UserProfilePage: FC = () => {
  const dispatch = useDispatch()

  const identity = useSelector(selectQuartzIdentity)
  const fakeOrg = {
    id: identity.currentIdentity.org.id,
    name: identity.currentIdentity.org.name,
    isDefault: true,
    isActive: true,
  }
  const {userAccounts, handleSetDefaultAccount} = useContext(UserAccountContext)

  const [defaultOrg, updateDefaultOrg] = useState(fakeOrg)
  const [defaultAccount, updateDefaultAccount] = useState(
    userAccounts ? userAccounts[0] : null
  )

  const handleChangeDefaults = () => {
    try {
      handleSetDefaultAccount(defaultAccount.id)
    } catch (err) {
      console.log(err)
    }

    // Kind of annoying that one takes org and one takes only ID. Maybe we can refactor this so
    // that handlesetDefaultAccount takes the whole object.
    try {
      dispatch(updateDefaultOrgThunk(defaultOrg))
    } catch (err) {
      console.log(err)
    }
    // Set the default org using a thunk
    // Assuming success, update the default org in redux state
    // Update default org in redux state

    // This is where we'll make the API call to update this information.
  }

  useEffect(() => {
    if (userAccounts) {
      updateDefaultAccount({
        ...userAccounts[0],
        id: userAccounts[0].id,
      })
    }
  }, [userAccounts])

  return (
    <>
      {/* Do we need a page here? */}
      <Page
        titleTag={pageTitleSuffixer(['Settings', 'Organization'])}
        style={{marginLeft: '32px', marginTop: '3px'}}
      >
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.FlexStart}
          justifyContent={JustifyContent.FlexStart}
          margin={ComponentSize.Medium}
          style={{width: '100%'}}
        >
          <Heading weight={FontWeight.Bold} element={HeadingElement.H1}>
            User Profile
          </Heading>
          <FlexBox
            direction={FlexDirection.Column}
            style={{width: '100%'}}
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
              style={{width: '60%'}}
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
                  defaultAccount={userAccounts[0]}
                  updateDefaultAccount={updateDefaultAccount}
                  accountList={userAccounts}
                />
              )}
              <DefaultOrgDropDown
                label="Default Organization"
                defaultOrg={fakeOrg}
                updateDefaultOrg={updateDefaultOrg}
                orgList={[fakeOrg]}
              />
              <Button
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

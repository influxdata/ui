import React, {useContext, useEffect, useState, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  ComponentSize,
  FlexBox,
  IconFont,
  Icon,
  JustifyContent,
} from '@influxdata/clockface'
import {selectQuartzOrgs} from 'src/identity/selectors'
import {selectQuartzIdentity} from 'src/identity/selectors'

import {UserAccountContext} from 'src/accounts/context/userAccount'
import {generateAccounts} from 'src/identity/mockAccountData'
import {generateOrgs} from 'src/identity/mockOrgData'
import {SubMenuItem} from '@influxdata/clockface'
import {OrgDropdown} from './OrgDropdown'
import {AccountDropdown} from './AccountDropdown'

import {getQuartzOrganizationsThunk} from 'src/quartzOrganizations/actions/thunks'

const globalHeaderStyle = {
  height: '60px',
  paddingTop: '12px',
  paddingRight: '32px',
  paddingBottom: '12px',
  // This is supposed to be 32px in figma, but doesn't produce an alignment. Might be part of component.
  paddingLeft: '22px',
  marginTop: '0px',
  marginRight: '0px',
  marginBottom: '0px',
  marginLeft: '0px',
}

// Remove bug with globalHeader showing up on error page.
export const GlobalHeader: FC = () => {
  const dispatch = useDispatch()
  // const {userAccounts} = useContext(UserAccountContext)
  // const userAccounts = generateAccounts(20000)
  const [userAccounts, setUserAccounts] = useState(generateAccounts(5000))
  const [quartzOrganizations, setQuartzOrganizations] = useState(
    generateOrgs(5000)
  )
  const fullIdentity = useSelector(selectQuartzIdentity)
  const userIdentity = fullIdentity.currentIdentity.user
  // const quartzOrganizations = useSelector(selectQuartzOrgs)

  const userName = userIdentity.firstName + ' ' + userIdentity.lastName

  const [activeOrg, setActiveOrg] = useState(quartzOrganizations.orgs[0])
  // set more useful default states here.
  const [activeAccount, setActiveAccount] = useState({} as SubMenuItem)

  useEffect(() => {
    const orgs = quartzOrganizations.orgs
    const activeOrg = orgs.find(org => org.isActive === true)
    if (activeOrg) {
      setActiveOrg(activeOrg)
    }
    if (orgs[0].id === '') {
      dispatch(getQuartzOrganizationsThunk())
    }
  }, [dispatch, quartzOrganizations])

  // May be able to optimize so that it only runs when there's a change in userAccounts.
  const accountsDropdownOptions =
    userAccounts?.map(acct => {
      return {name: acct.name, id: acct.id.toString()} as SubMenuItem
    }) || []

  useEffect(() => {
    const activeAccount = userAccounts?.find(
      account => account.isActive === true
    )
    setActiveAccount({
      name: activeAccount?.name,
      id: activeAccount?.id.toString(),
    })
  }, [userAccounts])

  // Remember to make size responsive for mobile.

  return (
    <FlexBox
      margin={ComponentSize.Large}
      justifyContent={JustifyContent.SpaceBetween}
      style={globalHeaderStyle}
    >
      <FlexBox margin={ComponentSize.Medium}>
        <AccountDropdown
          activeOrg={activeOrg}
          activeAccount={activeAccount}
          setActiveAccount={setActiveAccount}
          accountsList={accountsDropdownOptions}
        />
        {/* Need to replace this with a different icon. */}
        <Icon glyph={IconFont.CaretRight} />
        <OrgDropdown
          activeOrg={activeOrg}
          setActiveOrg={setActiveOrg}
          orgsList={quartzOrganizations?.orgs}
        />
      </FlexBox>
      <div>{userName}</div>
    </FlexBox>
  )
}

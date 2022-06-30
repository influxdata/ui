// For tomorrow - need to decide whether the .map functions should live in this component
// or the child components, and whether we should use state or memoize
// Use dictionary to generate random results

// Library imports
import React, {useContext, useEffect, useState, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  ComponentSize,
  FlexBox,
  IconFont,
  Icon,
  JustifyContent,
} from '@influxdata/clockface'

// Selectors and Context
import {selectQuartzIdentity} from 'src/identity/selectors'
import {UserAccountContext} from 'src/accounts/context/userAccount'

// Components
import {OrgDropdown} from './OrgDropdown'
import {AccountDropdown} from './AccountDropdown'

// Thunks
import {getQuartzOrganizationsThunk} from 'src/quartzOrganizations/actions/thunks'

// Styles
import {globalHeaderStyle} from './GlobalHeaderStyle'

// Utils

// Mock Data
import {randomEntityGenerator} from 'src/identity/mockdata/generateEntities'

export const GlobalHeader: FC = () => {
  const dispatch = useDispatch()

  // const identity = useSelector(selectQuartzIdentity)
  const [identity, setIdentity] = useState(randomEntityGenerator('org', 5000))
  const orgsList = identity.quartzOrganizations?.orgs

  const [userAccounts, setUserAccounts] = useState(
    randomEntityGenerator('account', 5000)
  )

  // Ternary operator needed here because accountsList not fetched when this component first loads.
  // const {userAccounts} = useContext(UserAccountContext)
  const accountsList = userAccounts ? userAccounts : [null] // eslint-disable-line react-hooks/exhaustive-deps

  const [activeOrg, setActiveOrg] = useState(null)

  const [activeAccount, setActiveAccount] = useState(null)

  useEffect(() => {
    dispatch(getQuartzOrganizationsThunk())
  }, [dispatch])

  useEffect(() => {
    if (orgsList) {
      setActiveOrg(orgsList?.find(org => org.isActive === true))
    }
  }, [orgsList])

  useEffect(() => {
    if (accountsList) {
      setActiveAccount(
        accountsList?.find(account => account?.isActive === true)
      )
    }
  }, [accountsList])

  return (
    <FlexBox
      margin={ComponentSize.Large}
      justifyContent={JustifyContent.SpaceBetween}
      style={globalHeaderStyle} // Move that over to scss file (add file name to chronograph)
    >
      <FlexBox margin={ComponentSize.Medium}>
        {activeOrg && activeAccount && (
          <>
            <AccountDropdown
              activeOrg={activeOrg}
              activeAccount={activeAccount}
              accountsList={accountsList}
            />
            <Icon glyph={IconFont.CaretRight} />
            <OrgDropdown activeOrg={activeOrg} orgsList={orgsList} />
          </>
        )}
      </FlexBox>
    </FlexBox>
  )
}

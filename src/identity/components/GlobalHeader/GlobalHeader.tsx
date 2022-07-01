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
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Styles
import {globalHeaderStyle} from './GlobalHeaderStyle'

// Mock Data
// import {randomEntityGenerator} from 'src/identity/mockdata/generateEntities'
import {
  emptyAccount,
  emptyOrg,
} from 'src/identity/components/GlobalHeader/DefaultEntities'

export const GlobalHeader: FC = () => {
  const dispatch = useDispatch()

  const identity = useSelector(selectQuartzIdentity)

  // Lines can be uncommented for purposes of mocking/testing with arbitrarily large account and org lists.
  // const [identity] = useState(randomEntityGenerator('org', 2000))
  const orgsList = identity.quartzOrganizations?.orgs

  const {userAccounts} = useContext(UserAccountContext)
  // const [userAccounts] = useState(randomEntityGenerator('account', 2000))

  const accountsList = userAccounts ? userAccounts : [emptyAccount] // eslint-disable-line react-hooks/exhaustive-deps

  const [sortedOrgs, setSortedOrgs] = useState([emptyOrg])
  const [sortedAccounts, setSortedAccts] = useState([emptyAccount])

  const [activeOrg, setActiveOrg] = useState(emptyOrg)
  const [activeAccount, setActiveAccount] = useState(emptyAccount)

  useEffect(() => {
    dispatch(getQuartzOrganizationsThunk())
  }, [dispatch])

  useEffect(() => {
    if (orgsList) {
      setActiveOrg(orgsList?.find(org => org.isActive === true))
      setSortedOrgs(
        [...orgsList].sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )
      )
    }
  }, [orgsList])

  useEffect(() => {
    if (accountsList.length > 0) {
      setActiveAccount(
        accountsList?.find(account => account?.isActive === true)
      )

      setSortedAccts(
        [...accountsList].sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )
      )
    }
  }, [accountsList])

  return (
    <FlexBox
      margin={ComponentSize.Large}
      justifyContent={JustifyContent.SpaceBetween}
      style={globalHeaderStyle}
    >
      <FlexBox margin={ComponentSize.Medium}>
        {activeOrg && activeAccount && (
          <>
            <AccountDropdown
              activeOrg={activeOrg}
              activeAccount={activeAccount}
              accountsList={sortedAccounts}
            />
            {/* Design is working on an adjustment to the caret, and submenu caret designs*/}
            <Icon glyph={IconFont.CaretRight} />
            <OrgDropdown activeOrg={activeOrg} orgsList={sortedOrgs} />
          </>
        )}
      </FlexBox>
    </FlexBox>
  )
}

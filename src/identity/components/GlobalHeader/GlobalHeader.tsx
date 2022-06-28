// Remove bug with globalHeader showing up on error page.

// Library imports
import React, {useContext, useEffect, useState, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  ComponentSize,
  FlexBox,
  IconFont,
  Icon,
  JustifyContent,
  SubMenuItem,
} from '@influxdata/clockface'

// Selectors and Context
import {selectQuartzIdentity} from 'src/identity/selectors'
import {UserAccountContext} from 'src/accounts/context/userAccount'

// Components
import {OrgDropdown} from './OrgDropdown'
import {AccountDropdown} from './AccountDropdown'

// Thunks
import {getQuartzOrganizationsThunk} from 'src/quartzOrganizations/actions/thunks'

// Utilities
import {mapAccountsToItems} from 'src/identity/utils/mapAccountsToItems'

// Styles
import {globalHeaderStyle} from './GlobalHeaderStyle'

// Mock Data
// import {generateAccounts} from 'src/identity/mockAccountData'
// import {generateOrgs} from 'src/identity/mockOrgData'

export const GlobalHeader: FC = () => {
  const dispatch = useDispatch()

  const identity = useSelector(selectQuartzIdentity)
  const {userAccounts} = useContext(UserAccountContext)
  // const [userAccounts, setUserAccounts] = useState(generateAccounts(5000))
  // const [identity, setIdentity] = useState(generateOrgs(5000))

  const [activeOrg, setActiveOrg] = useState({} as SubMenuItem)
  const [activeAccount, setActiveAccount] = useState({} as SubMenuItem)
  const orgsList = identity.quartzOrganizations?.orgs
  const accountsList = userAccounts ? mapAccountsToItems(userAccounts) : []

  useEffect(() => {
    const activeAccount = userAccounts?.find(
      account => account.isActive === true
    )
    if (activeAccount) {
      setActiveAccount({
        name: activeAccount?.name,
        id: activeAccount?.id.toString(),
      })
    }
  }, [userAccounts])

  useEffect(() => {
    const activeOrg = orgsList.find(org => org.isActive === true)
    if (activeOrg) {
      setActiveOrg(activeOrg)
    }
    if (orgsList[0].id === '') {
      dispatch(getQuartzOrganizationsThunk())
    }
  }, [dispatch, orgsList])

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
          accountsList={accountsList}
        />
        {/* Design will replace this with a different icon. */}
        <Icon glyph={IconFont.CaretRight} />
        <OrgDropdown
          activeOrg={activeOrg}
          setActiveOrg={setActiveOrg}
          orgsList={orgsList}
        />
      </FlexBox>
    </FlexBox>
  )
}

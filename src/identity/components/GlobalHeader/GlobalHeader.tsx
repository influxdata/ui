// Remove bug with globalHeader showing up on error page.
// For tomorrow - need to decide whether the .map functions should live in this component
// or the child components, and whether we should use state or memoize

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

// Mock Data
import {generateAccounts} from 'src/identity/mockAccountData'
import {generateOrgs} from 'src/identity/mockOrgData'

const loadingOrg = {
  id: '',
  name: '',
  isActive: false,
  isDefault: false,
}
const loadingAccount = {
  id: 0,
  name: '',
  isActive: false,
  isDefault: false,
}

export const GlobalHeader: FC = () => {
  const dispatch = useDispatch()

  // const identity = useSelector(selectQuartzIdentity)
  // const {userAccounts} = useContext(UserAccountContext)
  const [userAccounts, setUserAccounts] = useState(generateAccounts(5000))
  const [identity, setIdentity] = useState(generateOrgs(5000))

  const orgsList = identity.quartzOrganizations?.orgs // Might need to memoize the next
  const accountsList = userAccounts ? userAccounts : [loadingAccount] // eslint-disable-line react-hooks/exhaustive-deps

  const [activeOrg, setActiveOrg] = useState(loadingOrg)
  const [activeAccount, setActiveAccount] = useState(loadingAccount)

  useEffect(() => {
    const activeAccount = accountsList?.find(
      account => account.isActive === true
    )
    if (activeAccount) {
      setActiveAccount(activeAccount)
    }
  }, [accountsList])

  useEffect(() => {
    const activeOrg = orgsList?.find(org => org.isActive === true)
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
        <OrgDropdown activeOrg={activeOrg} orgsList={orgsList} />
      </FlexBox>
    </FlexBox>
  )
}

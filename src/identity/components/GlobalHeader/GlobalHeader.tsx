// Library imports
import React, {useContext, useEffect, useState, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  ComponentSize,
  FlexBox,
  IconFont,
  Icon,
  JustifyContent, InfluxColors,
} from '@influxdata/clockface'

// Selectors and Context
import {selectQuartzIdentity} from 'src/identity/selectors'
import {UserAccountContext} from 'src/accounts/context/userAccount'

// Components
import {OrgDropdown} from 'src/identity/components/GlobalHeader/OrgDropdown'
import {AccountDropdown} from 'src/identity/components/GlobalHeader/AccountDropdown'

// Thunks
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Styles
import 'src/identity/components/GlobalHeader/GlobalHeaderStyle.scss'

import {
  emptyAccount,
  emptyOrg,
} from 'src/identity/components/GlobalHeader/DefaultEntities'
import {alphaSortSelectedFirst} from 'src/identity/utils/alphaSortSelectedFirst'
import IdentityUserAvatar from 'src/identity/components/GlobalHeader/IdentityUserAvatar'

export const GlobalHeader: FC = () => {
  const dispatch = useDispatch()
  const identity = useSelector(selectQuartzIdentity)
  const orgsList = identity.quartzOrganizations.orgs
  const {userAccounts} = useContext(UserAccountContext)

  const accountsList = userAccounts ? userAccounts : [emptyAccount] // eslint-disable-line react-hooks/exhaustive-deps

  const [sortedOrgs, setSortedOrgs] = useState([emptyOrg])
  const [sortedAccounts, setSortedAccts] = useState([emptyAccount])

  const [activeOrg, setActiveOrg] = useState(emptyOrg)
  const [activeAccount, setActiveAccount] = useState(emptyAccount)

  useEffect(() => {
    if (activeAccount.id !== emptyAccount.id) {
      dispatch(getQuartzOrganizationsThunk(activeAccount.id))
    }
  }, [dispatch, activeAccount.id])

  useEffect(() => {
    if (accountsList[0].id !== 0) {
      const currentActiveAccount = accountsList?.find(
        account => account?.isActive === true
      )

      setActiveAccount(currentActiveAccount)

      setSortedAccts(alphaSortSelectedFirst(accountsList, currentActiveAccount))
    }
  }, [accountsList])

  useEffect(() => {
    if (orgsList[0].id !== '') {
      const currentActiveOrg = orgsList?.find(org => org.isActive === true)

      setActiveOrg(currentActiveOrg)

      setSortedOrgs(alphaSortSelectedFirst(orgsList, currentActiveOrg))
    }
  }, [orgsList])

  const caretStyle = {fontSize: '18px', color: InfluxColors.Grey65}

  return (
    <FlexBox
      margin={ComponentSize.Large}
      justifyContent={JustifyContent.SpaceBetween}
      className="multiaccountorg--header"
    >
      <FlexBox margin={ComponentSize.Medium}>
        {activeOrg && activeAccount && (
          <>
            <AccountDropdown
              activeOrg={activeOrg}
              activeAccount={activeAccount}
              accountsList={sortedAccounts}
            />
            <Icon glyph={IconFont.CaretOutlineRight} style={caretStyle} />
            <OrgDropdown activeOrg={activeOrg} orgsList={sortedOrgs} />
          </>
        )}
      </FlexBox>
      <IdentityUserAvatar user={identity.currentIdentity.user} />
    </FlexBox>
  )
}

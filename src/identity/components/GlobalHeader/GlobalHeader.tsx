// Library imports
import React, {FC, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  ComponentSize,
  FlexBox,
  Icon,
  IconFont,
  InfluxColors,
  JustifyContent,
} from '@influxdata/clockface'

// Selectors and Context
import {getOrg} from 'src/organizations/selectors'
import {selectQuartzIdentity} from 'src/identity/selectors'
import {UserAccountContext} from 'src/accounts/context/userAccount'

// Components
import {AccountDropdown} from 'src/identity/components/GlobalHeader/AccountDropdown'
import {OrgDropdown} from 'src/identity/components/GlobalHeader/OrgDropdown'

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
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

const caretStyle = {fontSize: '18px', color: InfluxColors.Grey65}
const rightHandContainerStyle = {marginLeft: 'auto'}

export const GlobalHeader: FC = () => {
  const dispatch = useDispatch()
  const identity = useSelector(selectQuartzIdentity)
  const {user} = identity.currentIdentity
  const org = useSelector(getOrg)

  const orgsList = identity.quartzOrganizations.orgs
  const {userAccounts} = useContext(UserAccountContext)

  const accountsList = userAccounts?.length > 0 ? userAccounts : [emptyAccount] // eslint-disable-line react-hooks/exhaustive-deps

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

  const shouldLoadDropdowns = Boolean(activeOrg?.id && activeAccount?.id)

  const shouldLoadAvatar = Boolean(user?.email && org?.id)
  const avatarFirstName =
    typeof user?.firstName === 'string' ? user.firstName.trim() : ''
  const avatarLastName =
    typeof user?.lastName === 'string' ? user.lastName.trim() : ''

  const shouldLoadGlobalHeader = Boolean(
    shouldLoadDropdowns || shouldLoadAvatar
  )

  return shouldLoadGlobalHeader ? (
    <FlexBox
      className="multiaccountorg--header"
      justifyContent={JustifyContent.SpaceBetween}
      margin={ComponentSize.Large}
      testID="global-header--container"
    >
      {shouldLoadDropdowns && (
        <FlexBox margin={ComponentSize.Medium}>
          <AccountDropdown
            activeAccount={activeAccount}
            activeOrg={activeOrg}
            accountsList={sortedAccounts}
          />
          <Icon glyph={IconFont.CaretOutlineRight} style={caretStyle} />
          <OrgDropdown activeOrg={activeOrg} orgsList={sortedOrgs} />
        </FlexBox>
      )}

      <FlexBox
        margin={ComponentSize.Large}
        style={rightHandContainerStyle}
        justifyContent={JustifyContent.FlexEnd}
      >
        <RateLimitAlert location="global header" />
        {shouldLoadAvatar && (
          <IdentityUserAvatar
            email={user.email}
            firstName={avatarFirstName}
            lastName={avatarLastName}
            orgId={org.id}
          />
        )}
      </FlexBox>
    </FlexBox>
  ) : null
}

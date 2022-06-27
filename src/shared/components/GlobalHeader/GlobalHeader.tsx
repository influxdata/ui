import React, {useContext, useEffect, useState} from 'react'
import {
  ComponentSize,
  FlexBox,
  Icon,
  IconFont,
  JustifyContent,
} from '@influxdata/clockface'
import {UserAccountContext} from 'src/accounts/context/userAccount'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'
import {CLOUD_URL} from '../../constants'
import {useDispatch, useSelector} from 'react-redux'
import {selectQuartzOrgs} from 'src/identity/selectors'
import {getQuartzOrganizationsThunk} from 'src/quartzOrganizations/actions/thunks'

const globalHeaderStyle = {
  padding: '0 32px 0 32px',
  margin: '24px 0 24px 0',
}

const GlobalHeader = () => {
  const {userAccounts} = useContext(UserAccountContext)
  const [activeAccount, setActiveAccount] = useState({} as SubMenuItem)

  // We should check whether this information needs to be in state at all, since page is reloaded
  // after each click to a new 'account' or 'organization' at this stage.
  const quartzOrganizations = useSelector(selectQuartzOrgs)
  const [activeOrg, setActiveOrg] = useState(quartzOrganizations.orgs[0])
  const dispatch = useDispatch()

  // May be able to optimize so that it only runs when there's a change in userAccounts.
  const accountsDropdownOptions =
    userAccounts?.map(acct => {
      return {name: acct.name, id: acct.id.toString()} as SubMenuItem
    }) || []

  // Filter will iterate through the whole array, so let's either use .find (since we can assume at least one active account)
  // or add error handling for cases where there's more than one active account.
  useEffect(() => {
    const activeAccount = userAccounts?.filter(acct => acct.isActive)[0]
    setActiveAccount({
      name: activeAccount?.name,
      id: activeAccount?.id.toString(),
    })
  }, [userAccounts])

  useEffect(() => {
    const orgs = quartzOrganizations.orgs
    // Check whether any org is active. Will only be true before page finishes loading.
    const activeOrg = orgs.find(org => org.isActive === true)
    // If there is an active org, set it to that org. Otherwise, set it to empty default org.
    if (activeOrg) {
      // Per figma, don't include the '@whatever.com' in the name.
      setActiveOrg({...activeOrg, name: activeOrg.name.replace(/\@.*/, '')})
    }
    if (orgs[0].id === '') {
      dispatch(getQuartzOrganizationsThunk())
    }
  }, [dispatch, quartzOrganizations])

  // Do we need to set the active account when we are already refreshing?
  const switchAccount = (account: SubMenuItem) => {
    setActiveAccount(account)
    window.location.href = `${CLOUD_URL}/accounts/${account.id}`
  }

  const switchOrg = (org: SubMenuItem) => {
    window.location.href = `/orgs/${org.id}`
  }

  // I think we should probably import both of these from another file so that it doesn't clutter up the component,
  // and so that we can change them separately.
  const accountDropdownMenuLinkOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/accounts/settings`,
    },
    {
      name: 'Members',
      iconFont: IconFont.UserOutline_New,
      // List user members within an organization. Need to figure out what to do here.
      href: '/',
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: `/orgs/${activeOrg.id}/billing`,
    },
  ]

  const orgHrefOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/about`,
    },
    {
      name: 'Members',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/users`,
    },
    {
      name: 'Usage',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/usage`,
    },
  ]

  // Same with the dropdowns. When we refactor we can keep them in a different component.
  // Remember to make size responsive for mobile.
  const orgDropdown = (
    <MenuDropdown
      // Check largelist ceiling settings
      largeListSearch={true}
      largeListCeiling={15}
      selectedOption={activeOrg}
      options={orgHrefOptions}
      subMenuOptions={quartzOrganizations.orgs}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Organization"
      searchText="Search Organizations"
      style={{width: '200px'}}
      menuStyle={{width: '250px'}}
      onSelectOption={switchOrg}
    />
  )

  return (
    <FlexBox
      margin={ComponentSize.Large}
      justifyContent={JustifyContent.SpaceBetween}
      style={globalHeaderStyle}
    >
      <FlexBox margin={ComponentSize.Medium}>
        <MenuDropdown
          largeListSearch={true}
          selectedOption={activeAccount}
          largeListCeiling={15}
          options={accountDropdownMenuLinkOptions}
          subMenuOptions={accountsDropdownOptions}
          menuHeaderIcon={IconFont.Switch_New}
          menuHeaderText="Switch Account"
          style={{width: 'auto'}}
          menuStyle={{width: '250px'}}
          onSelectOption={switchAccount}
        />
        {orgDropdown}
      </FlexBox>
      <div>User Icon</div>
    </FlexBox>
  )
}

export default GlobalHeader

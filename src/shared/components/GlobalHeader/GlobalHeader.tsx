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
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

const globalHeaderStyle = {
  padding: '0 32px 0 32px',
  margin: '24px 0 24px 0',
}

const GlobalHeader = () => {
  const {userAccounts} = useContext(UserAccountContext)
  const [activeAccount, setActiveAccount] = useState({} as SubMenuItem)
  const currentOrg = useSelector(getOrg)

  const accountsDropdownOptions =
    userAccounts?.map(acct => {
      return {name: acct.name, id: acct.id.toString()} as SubMenuItem
    }) || []

  useEffect(() => {
    const activeAccount = userAccounts?.filter(acct => acct.isActive)[0]
    setActiveAccount({
      name: activeAccount?.name,
      id: activeAccount?.id.toString(),
    })
  }, [userAccounts])

  const switchAccount = (account: SubMenuItem) => {
    setActiveAccount(account)
    window.location.href = `${CLOUD_URL}/accounts/${account.id}`
  }

  const orgs = [
    {id: '1', name: '1'},
    {
      id: '2',
      name: '2',
    },
    {
      id: '3',
      name: '3',
    },
  ]

  const accountDropdownMenuLinkOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${currentOrg.id}/accounts/settings`,
    },
    {
      name: 'Members',
      iconFont: IconFont.UserOutline_New,
      // List user members within an organizaiton
      href: '/',
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: `/orgs/${currentOrg.id}/billing`,
    },
  ]

  const orgHrefOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: '/orgs/${org.id}/about',
    },
    {
      name: 'Members',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${currentOrg.id}/users`,
    },
    {
      name: 'Usage',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${currentOrg.id}/usage`,
    },
  ]

  const orgDropdown = (
    <MenuDropdown
      // Check largelist ceiling settings
      largeListSearch={true}
      largeListCeiling={15}
      selectedOption={currentOrg}
      options={orgHrefOptions}
      subMenuOptions={orgs}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Organization"
      searchText="Search Organizations"
      style={{width: '110px'}}
      menuStyle={{width: '250px'}}
      onSelectOption={() => {
        console.log('clicked an org option')
      }}
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

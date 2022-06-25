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

const globalHeaderStyle = {
  padding: '0 32px 0 32px',
  margin: '24px 0 24px 0',
}

const GlobalHeader = () => {
  const {userAccounts} = useContext(UserAccountContext)
  const [activeAccount, setActiveAccount] = useState({} as SubMenuItem)

  const accountsDropdownOptions =
    userAccounts?.map(acct => {
      return {name: acct.name, id: acct.id.toString()} as SubMenuItem
    }) || []

  useEffect(() => {
    const activeAccount = userAccounts?.filter(acct => acct.isActive)[0]
    setActiveAccount({name: activeAccount?.name, id: activeAccount?.id.toString()})
  }, [userAccounts])

  const accountDropdownMenuLinkOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: '/settings',
    },
    {
      name: 'Members',
      iconFont: IconFont.UserOutline_New,
      href: '/members',
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: '/billing',
    },
  ]
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
          style={{width: '110px'}}
          menuStyle={{width: '250px'}}
          onSelectOption={setActiveAccount}
        />
        <Icon glyph={IconFont.CaretRight}></Icon>
        <div>Org Dropdown</div>
      </FlexBox>
      <div>User Icon</div>
    </FlexBox>
  )
}

export default GlobalHeader

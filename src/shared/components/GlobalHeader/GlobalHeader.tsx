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

  const accountDropdownMenuLinkOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${currentOrg.id}/accounts/settings`,
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: `/orgs/${currentOrg.id}/billing`,
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
          style={{width: 'auto'}}
          menuStyle={{width: '250px'}}
          onSelectOption={switchAccount}
        />
        <Icon glyph={IconFont.CaretRight}></Icon>
        <div>Org Dropdown</div>
      </FlexBox>
      <div>User Icon</div>
    </FlexBox>
  )
}

export default GlobalHeader

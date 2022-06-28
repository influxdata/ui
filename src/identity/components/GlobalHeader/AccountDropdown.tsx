import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'

interface Props {
  activeOrg
  activeAccount
  setActiveAccount: Function
  accountsList
}

export const AccountDropdown: FC<Props> = ({
  activeOrg,
  activeAccount,
  setActiveAccount,
  accountsList,
}) => {
  const accountDropdownMenuLinkOptions = [
    {
      name: 'Settings',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/accounts/settings`,
    },
    {
      name: 'Members',
      iconFont: IconFont.UserOutline_New,
      href: '/',
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: `/orgs/${activeOrg.id}/billing`,
    },
  ]

  const switchAccount = (account: SubMenuItem) => {
    setActiveAccount(account)
    window.location.href = `orgs/${activeOrg.id}/accounts/${account.id}`
  }

  return (
    <MenuDropdown
      largeListSearch={true}
      selectedOption={activeAccount}
      largeListCeiling={25}
      options={accountDropdownMenuLinkOptions}
      subMenuOptions={accountsList}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Account"
      style={{width: '200px'}}
      // menuStyle={{width: '250px'}}
      onSelectOption={switchAccount}
    />
  )
}

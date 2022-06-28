import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  activeAccount: UserAccount
  setActiveAccount: Function
  accountsList: UserAccount[]
}

export const AccountDropdown: FC<Props> = ({
  activeOrg,
  activeAccount,
  setActiveAccount,
  accountsList,
}) => {
  const accountOptions = accountsList.map(account => ({
    id: account.id.toString(),
    name: account.name,
  }))

  const selectedAccount = {
    id: activeAccount.id.toString(),
    name: activeAccount.name,
  }

  const accountMainMenu = [
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
      selectedOption={selectedAccount}
      largeListCeiling={25}
      options={accountMainMenu}
      subMenuOptions={accountOptions}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Account"
      style={{width: 'auto'}}
      menuStyle={{width: '200px'}}
      onSelectOption={switchAccount}
    />
  )
}

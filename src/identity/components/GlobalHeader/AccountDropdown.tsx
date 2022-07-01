import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  activeAccount: UserAccount
  // setActiveAccount: Function
  accountsList: UserAccount[]
}

export const AccountDropdown: FC<Props> = ({
  activeOrg,
  activeAccount,
  accountsList,
}) => {
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
    // 'Members' is listed on the Figma, but discussed with design, and this may not exist yet.
    // {
    //   name: 'Members',
    //   iconFont: IconFont.UserOutline_New,
    //   href: '/',
    // },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: `/orgs/${activeOrg.id}/billing`,
    },
  ]

  const switchAccount = (account: SubMenuItem) => {
    window.location.href = `orgs/${activeOrg.id}/accounts/${account.id}`
  }

  return (
    <MenuDropdown
      selectedOption={selectedAccount}
      options={accountMainMenu}
      subMenuOptions={accountsList}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Account"
      style={{width: 'auto'}}
      menuStyle={{width: '250px'}}
      onSelectOption={switchAccount}
    />
  )
}

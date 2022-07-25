import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  activeAccount: UserAccount
  accountsList: UserAccount[]
}

const style = {width: 'auto'}
const menuStyle = {width: '250px'}

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
      iconFont: IconFont.CogSolid_New,
      href: `/orgs/${activeOrg.id}/accounts/settings`,
    },
    {
      name: 'Billing',
      iconFont: IconFont.PieChart,
      href: `/orgs/${activeOrg.id}/billing`,
    },
  ]

  // Quartz handles switching accounts by having the user hit this URL.
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
      style={style}
      menuStyle={menuStyle}
      onSelectOption={switchAccount}
    />
  )
}

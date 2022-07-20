import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
import {
  GlobalHeaderDropdown,
  TypeAheadMenuItem,
} from './GlobalHeaderDropdown/GlobalHeaderDropdown'

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
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/accounts/settings`,
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: `/orgs/${activeOrg.id}/billing`,
    },
  ]

  // Quartz handles switching accounts by having the user hit this URL.
  const switchAccount = (account: TypeAheadMenuItem) => {
    window.location.href = `orgs/${activeOrg.id}/accounts/${account.id}`
  }

  return (
    <GlobalHeaderDropdown
      typeAheadSelectedOption={selectedAccount}
      mainMenuOptions={accountMainMenu}
      typeAheadMenuOptions={accountsList}
      mainMenuHeaderIcon={IconFont.Switch_New}
      mainMenuHeaderText="Switch Account"
      style={style}
      dropdownMenuStyle={menuStyle}
      typeAheadOnSelectOption={switchAccount}
    />
  )
}

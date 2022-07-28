import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
import {
  GlobalHeaderDropdown,
  TypeAheadMenuItem,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

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
      dropdownMenuStyle={menuStyle}
      mainMenuHeaderIcon={IconFont.Switch_New}
      mainMenuHeaderText="Switch Account"
      mainMenuOptions={accountMainMenu}
      style={style}
      typeAheadInputPlaceholder="Search Accounts"
      typeAheadMenuOptions={accountsList}
      typeAheadOnSelectOption={switchAccount}
      typeAheadSelectedOption={selectedAccount}
    />
  )
}

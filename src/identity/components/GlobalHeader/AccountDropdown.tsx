// Libraries
import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'

// Types
type OrgSummaryItem = OrganizationSummaries[number]
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

interface Props {
  activeOrg: OrgSummaryItem
  activeAccount: UserAccount
  accountsList: UserAccount[]
}

// Styles
const style = {width: 'auto'}
const menuStyle = {width: '250px'}

// Components
import {
  GlobalHeaderDropdown,
  TypeAheadMenuItem,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

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
      href: `${CLOUD_URL}/orgs/${activeOrg.id}/accounts/settings`,
    },
    {
      name: 'Billing',
      iconFont: IconFont.Bill,
      href: `${CLOUD_URL}/orgs/${activeOrg.id}/billing`,
    },
  ]

  // Quartz handles switching accounts by having the user hit this URL.
  const switchAccount = (account: TypeAheadMenuItem) => {
    window.location.href = `${CLOUD_URL}/accounts/${account.id}`
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

// Libraries
import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'

// Types
type OrgSummaryItem = OrganizationSummaries[number]
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
import {
  MainMenuEventPrefix,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEventNames'

interface Props {
  activeOrg: OrgSummaryItem
  activeAccount: UserAccount
  accountsList: UserAccount[]
}

// Utils
import {multiOrgEvent} from 'src/identity/events/multiOrgEvent'

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
    multiOrgEvent('headerNav.account.switched', {
      'New Account ID': account.id,
      'New Account Name': account.name,
    })
    window.location.href = `${CLOUD_URL}/accounts/${account.id}`
  }

  const handleClick = () => {
    // This clicking is going to get very busy. Confirm with Amy.
    multiOrgEvent('headerNav.accountDropdown.clicked')
  }

  return (
    <div onClick={handleClick}>
      <GlobalHeaderDropdown
        typeAheadEventPrefix={TypeAheadEventPrefix.HeaderNavSearchAccount}
        dropdownMenuStyle={menuStyle}
        mainMenuEventPrefix={MainMenuEventPrefix.HeaderNavChangeAccount}
        mainMenuHeaderIcon={IconFont.Switch_New}
        mainMenuHeaderText="Switch Account"
        mainMenuOptions={accountMainMenu}
        style={style}
        typeAheadInputPlaceholder="Search Accounts"
        typeAheadMenuOptions={accountsList}
        typeAheadOnSelectOption={switchAccount}
        typeAheadSelectedOption={selectedAccount}
      />
    </div>
  )
}

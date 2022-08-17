// Libraries
import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'

// Types
type OrgSummaryItem = OrganizationSummaries[number]
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'
import {DropdownName} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'
import {TypeAheadLocation} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/GlobalHeaderTypeAheadMenu'

interface Props {
  activeOrg: OrgSummaryItem
  activeAccount: UserAccount
  accountsList: UserAccount[]
}

// Utils
import {event} from 'src/cloud/utils/reporting'

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
    event(
      'headerNav.account.switched',
      {initiative: 'multiOrg'},
      {'New Account ID': account.id, 'New Account Name': account.name}
    )
    window.location.href = `${CLOUD_URL}/accounts/${account.id}`
  }

  const handleClick = () => {
    // This clicking is going to get very busy. Confirm with Amy.
    event('headerNav.accountDropdown.clicked')
  }

  return (
    <div onClick={handleClick}>
      <GlobalHeaderDropdown
        dropdownLocation={TypeAheadLocation.HeaderNavSearchAccount}
        dropdownMenuStyle={menuStyle}
        entity={DropdownName.HeaderNavChangeAccount}
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

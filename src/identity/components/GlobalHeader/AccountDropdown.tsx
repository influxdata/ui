// Libraries
import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'

// Types
type OrgSummaryItem = OrganizationSummaries[number]
import {OrganizationSummaries, UserAccount} from 'src/client/unityRoutes'

interface Props {
  activeAccount: UserAccount
  accountsList: UserAccount[]
  activeOrg: OrgSummaryItem
}

// Eventing
import {
  HeaderNavEvent,
  MainMenuEventPrefix,
  multiOrgEvent,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEvents'

// Styles
const accountDropdownStyle = {width: 'auto'}
const menuStyle = {width: '250px'}

// Components
import {
  GlobalHeaderDropdown,
  TypeAheadMenuItem,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

export const AccountDropdown: FC<Props> = ({
  accountsList,
  activeAccount,
  activeOrg,
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
    multiOrgEvent(HeaderNavEvent.AccountSwitch, {
      newAccountID: account.id,
      newAccountName: account.name,
    })
    window.location.href = `${CLOUD_URL}/accounts/${account.id}`
  }

  const sendDropdownClickEvent = () => {
    multiOrgEvent(HeaderNavEvent.AccountDropdownClick)
  }

  return (
    <div onClick={sendDropdownClickEvent}>
      <GlobalHeaderDropdown
        dropdownMenuStyle={menuStyle}
        mainMenuEventPrefix={MainMenuEventPrefix.SwitchAccount}
        mainMenuHeaderIcon={IconFont.Switch_New}
        mainMenuHeaderText="Switch Account"
        mainMenuOptions={accountMainMenu}
        style={accountDropdownStyle}
        typeAheadEventPrefix={TypeAheadEventPrefix.HeaderNavSearchAccount}
        typeAheadInputPlaceholder="Search Accounts"
        typeAheadMenuOptions={accountsList}
        typeAheadOnSelectOption={switchAccount}
        typeAheadSelectedOption={selectedAccount}
      />
    </div>
  )
}

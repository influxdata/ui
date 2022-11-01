// Libraries
import React, {FC, useMemo} from 'react'
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
  multiOrgTag,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

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

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const AccountDropdown: FC<Props> = ({
  accountsList,
  activeAccount,
  activeOrg,
}) => {
  const selectedAccount = {
    id: activeAccount.id.toString(),
    name: activeAccount.name,
  }

  const isCreateDeleteFlagOn = isFlagEnabled('createDeleteOrgs')

  const accountMainMenu = useMemo(
    () =>
      [
        {
          name: 'Settings',
          iconFont: IconFont.CogSolid_New,
          href: `/orgs/${activeOrg.id}/accounts/settings`,
          enabled: true,
        },
        {
          name: 'Organizations',
          iconFont: IconFont.Group,
          href: `/orgs/${activeOrg.id}/accounts/orglist`,
          enabled: isCreateDeleteFlagOn,
        },
        {
          name: 'Billing',
          iconFont: IconFont.Bill,
          href: `/orgs/${activeOrg.id}/billing`,
          enabled: true,
        },
      ].filter(menuOption => menuOption.enabled),
    [activeOrg.id, isCreateDeleteFlagOn]
  )

  // Quartz handles switching accounts by having the user hit this URL.
  const switchAccount = (account: TypeAheadMenuItem) => {
    event(HeaderNavEvent.AccountSwitch, multiOrgTag, {
      newAccountID: account.id,
      newAccountName: account.name,
    })
    window.location.href = `${CLOUD_URL}/accounts/${account.id}`
  }

  const sendDropdownClickEvent = () => {
    event(HeaderNavEvent.AccountDropdownClick, multiOrgTag)
  }

  return (
    <div onClick={sendDropdownClickEvent}>
      <GlobalHeaderDropdown
        dropdownMenuStyle={menuStyle}
        mainMenuEventPrefix={MainMenuEventPrefix.SwitchAccount}
        mainMenuHeaderIcon={IconFont.Switch_New}
        mainMenuHeaderText="Switch Account"
        mainMenuOptions={accountMainMenu}
        mainMenuTestID="globalheader--account-dropdown-main"
        style={accountDropdownStyle}
        testID="globalheader--account-dropdown"
        typeAheadEventPrefix={TypeAheadEventPrefix.HeaderNavSearchAccount}
        typeAheadInputPlaceholder="Search Accounts"
        typeAheadMenuOptions={accountsList}
        typeAheadOnSelectOption={switchAccount}
        typeAheadSelectedOption={selectedAccount}
        typeAheadTestID="globalheader--account-dropdown-typeahead"
      />
    </div>
  )
}

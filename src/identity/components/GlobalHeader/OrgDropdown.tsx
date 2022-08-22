// Libraries
import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'

// Components
import {
  GlobalHeaderDropdown,
  TypeAheadMenuItem,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

// Types
import {OrganizationSummaries} from 'src/client/unityRoutes'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Eventing
import {
  HeaderNavEvent,
  MainMenuEventPrefix,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  orgsList: OrganizationSummaries
}

const menuStyle = {width: '250px'}
const orgDropdownStyle = {width: 'auto'}

export const OrgDropdown: FC<Props> = ({activeOrg, orgsList}) => {
  const switchOrg = (org: TypeAheadMenuItem) => {
    event(
      HeaderNavEvent.OrgSwitch,
      {initiative: 'multiOrg'},
      {
        oldOrgID: activeOrg.id,
        oldOrgName: activeOrg.name,
        newOrgID: org.id,
        newOrgName: org.name,
      }
    )
    window.location.href = `${CLOUD_URL}/orgs/${org.id}`
  }

  const orgMainMenu = [
    {
      name: 'Settings',
      iconFont: IconFont.CogSolid_New,
      href: `/orgs/${activeOrg.id}/org-settings`,
    },
    {
      name: 'Members',
      iconFont: IconFont.Group,
      href: `/orgs/${activeOrg.id}/members`,
    },
    {
      name: 'Usage',
      iconFont: IconFont.PieChart,
      href: `/orgs/${activeOrg.id}/usage`,
    },
  ]

  const sendDropdownClickEvent = () => {
    event(HeaderNavEvent.OrgDropdownClick, {initiative: 'multiOrg'})
  }

  return (
    <div onClick={sendDropdownClickEvent}>
      <GlobalHeaderDropdown
        dropdownMenuStyle={menuStyle}
        mainMenuEventPrefix={MainMenuEventPrefix.SwitchOrg}
        mainMenuHeaderIcon={IconFont.Switch_New}
        mainMenuHeaderText="Switch Organization"
        mainMenuOptions={orgMainMenu}
        mainMenuTestID="globalheader--org-dropdown-main"
        style={orgDropdownStyle}
        testID="globalheader--org-dropdown"
        typeAheadEventPrefix={TypeAheadEventPrefix.HeaderNavSearchOrg}
        typeAheadInputPlaceholder="Search Organizations"
        typeAheadMenuOptions={orgsList}
        typeAheadOnSelectOption={switchOrg}
        typeAheadSelectedOption={activeOrg}
        typeAheadTestID="globalheader--org-dropdown-typeahead"
      />
    </div>
  )
}

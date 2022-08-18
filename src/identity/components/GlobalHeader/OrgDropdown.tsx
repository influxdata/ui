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
  multiOrgEvent,
  TypeAheadEventPrefix,
} from 'src/identity/events/multiOrgEvents'

const switchOrg = (org: TypeAheadMenuItem) => {
  multiOrgEvent(HeaderNavEvent.HeaderNavOrgSwitch, {
    newOrgID: org.id,
    newOrgName: org.name,
  })
  window.location.href = `${CLOUD_URL}/orgs/${org.id}`
}

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  orgsList: OrganizationSummaries
}

const menuStyle = {width: '250px'}
const orgDropdownStyle = {width: 'auto'}

export const OrgDropdown: FC<Props> = ({activeOrg, orgsList}) => {
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

  const sendOrgDropdownEvent = () => {
    multiOrgEvent(HeaderNavEvent.HeaderNavOrgDropdownClick)
  }

  return (
    <div onClick={sendOrgDropdownEvent}>
      <GlobalHeaderDropdown
        dropdownMenuStyle={menuStyle}
        mainMenuEventPrefix={MainMenuEventPrefix.HeaderNavChangeOrg}
        mainMenuHeaderIcon={IconFont.Switch_New}
        mainMenuHeaderText="Switch Organization"
        mainMenuOptions={orgMainMenu}
        style={orgDropdownStyle}
        typeAheadEventPrefix={TypeAheadEventPrefix.HeaderNavSearchOrg}
        typeAheadInputPlaceholder="Search Organizations"
        typeAheadMenuOptions={orgsList}
        typeAheadOnSelectOption={switchOrg}
        typeAheadSelectedOption={activeOrg}
      />
    </div>
  )
}

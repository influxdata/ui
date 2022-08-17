// Libraries
import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'

// Components
import {
  GlobalHeaderDropdown,
  TypeAheadMenuItem,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {DropdownName} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'
import {OrganizationSummaries} from 'src/client/unityRoutes'
import {TypeAheadLocation} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/GlobalHeaderTypeAheadMenu'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

const switchOrg = (org: TypeAheadMenuItem) => {
  event(
    'headerNav.org.switched',
    {initiative: 'multiOrg'},
    {'New Account ID': org.id, 'New Account Name': org.name}
  )
  window.location.href = `${CLOUD_URL}/orgs/${org.id}`
}

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  orgsList: OrganizationSummaries
}

const menuStyle = {width: '250px'}
const style = {width: 'auto'}

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

  const handleClick = () => {
    // This clicking is going to get very busy. Confirm with Amy.
    event('headerNav.orgDropdown.clicked')
  }

  return (
    <div onClick={handleClick}>
      <GlobalHeaderDropdown
        dropdownLocation={TypeAheadLocation.HeaderNavSearchOrg}
        dropdownMenuStyle={menuStyle}
        entity={DropdownName.HeaderNavChangeOrg}
        mainMenuHeaderIcon={IconFont.Switch_New}
        mainMenuHeaderText="Switch Organization"
        mainMenuOptions={orgMainMenu}
        style={style}
        typeAheadInputPlaceholder="Search Organizations"
        typeAheadMenuOptions={orgsList}
        typeAheadOnSelectOption={switchOrg}
        typeAheadSelectedOption={activeOrg}
      />
    </div>
  )
}

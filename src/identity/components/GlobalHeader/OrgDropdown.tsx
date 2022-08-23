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

const switchOrg = (org: TypeAheadMenuItem) => {
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

  return (
    <GlobalHeaderDropdown
      dropdownMenuStyle={menuStyle}
      mainMenuHeaderIcon={IconFont.Switch_New}
      mainMenuHeaderText="Switch Organization"
      mainMenuOptions={orgMainMenu}
      mainMenuTestID="globalheader--org-dropdown-main"
      style={style}
      typeAheadInputPlaceholder="Search Organizations"
      typeAheadMenuOptions={orgsList}
      typeAheadOnSelectOption={switchOrg}
      typeAheadSelectedOption={activeOrg}
      testID="globalheader--org-dropdown"
      typeAheadTestID="globalheader--org-dropdown-typeahead"
    />
  )
}

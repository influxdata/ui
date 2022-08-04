// Libraries
import React, {FC} from 'react'
import {IconFont} from '@influxdata/clockface'

// Components
import {
  TypeAheadMenuItem,
  GlobalHeaderDropdown,
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

const style = {width: 'auto'}
const menuStyle = {width: '250px'}

export const OrgDropdown: FC<Props> = ({activeOrg, orgsList}) => {
  const orgMainMenu = [
    {
      name: 'Settings',
      iconFont: IconFont.CogSolid_New,
      href: `${CLOUD_URL}/orgs/${activeOrg.id}/about`,
    },
    {
      name: 'Members',
      iconFont: IconFont.Group,
      href: `${CLOUD_URL}/orgs/${activeOrg.id}/users`,
    },
    {
      name: 'Usage',
      iconFont: IconFont.PieChart,
      href: `${CLOUD_URL}/orgs/${activeOrg.id}/usage`,
    },
  ]

  return (
    <GlobalHeaderDropdown
      dropdownMenuStyle={menuStyle}
      mainMenuHeaderIcon={IconFont.Switch_New}
      mainMenuHeaderText="Switch Organization"
      mainMenuOptions={orgMainMenu}
      style={style}
      typeAheadInputPlaceholder="Search Organizations"
      typeAheadMenuOptions={orgsList}
      typeAheadOnSelectOption={switchOrg}
      typeAheadSelectedOption={activeOrg}
    />
  )
}

import React, {FC} from 'react'
import {OrganizationSummaries} from 'src/client/unityRoutes'
import {
  TypeAheadMenuItem,
  GlobalHeaderDropdown,
} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'
import {IconFont} from '@influxdata/clockface'

const switchOrg = (org: TypeAheadMenuItem) => {
  window.location.href = `/orgs/${org.id}`
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
      href: `/orgs/${activeOrg.id}/about`,
    },
    {
      name: 'Members',
      iconFont: IconFont.Group,
      href: `/orgs/${activeOrg.id}/users`,
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
      style={style}
      typeAheadInputPlaceholder="Search Organizations"
      typeAheadMenuOptions={orgsList}
      typeAheadOnSelectOption={switchOrg}
      typeAheadSelectedOption={activeOrg}
    />
  )
}

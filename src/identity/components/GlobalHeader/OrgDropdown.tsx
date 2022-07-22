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
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/about`,
    },
    {
      name: 'Members',
      iconFont: IconFont.UserOutline_New,
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
      typeAheadSelectedOption={activeOrg}
      mainMenuOptions={orgMainMenu}
      typeAheadMenuOptions={orgsList}
      mainMenuHeaderIcon={IconFont.Switch_New}
      mainMenuHeaderText="Switch Organization"
      typeAheadInputPlaceholder="Search Organizations"
      style={style}
      dropdownMenuStyle={menuStyle}
      typeAheadOnSelectOption={switchOrg}
    />
  )
}

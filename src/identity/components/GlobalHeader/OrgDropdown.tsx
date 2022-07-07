import React, {FC} from 'react'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'
import {IconFont} from '@influxdata/clockface'
import {OrganizationSummaries} from 'src/client/unityRoutes'

const switchOrg = (org: SubMenuItem) => {
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
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/users`,
    },
    {
      name: 'Usage',
      iconFont: IconFont.CogOutline,
      href: `/orgs/${activeOrg.id}/usage`,
    },
  ]

  return (
    <MenuDropdown
      selectedOption={activeOrg}
      options={orgMainMenu}
      subMenuOptions={orgsList}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Organization"
      searchText="Search Organizations"
      style={style}
      menuStyle={menuStyle}
      onSelectOption={switchOrg}
    />
  )
}

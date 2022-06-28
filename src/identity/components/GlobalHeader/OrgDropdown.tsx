import React, {FC} from 'react'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'
import {IconFont} from '@influxdata/clockface'
import {OrganizationSummaries} from 'src/client/unityRoutes'

type OrgSummaryItem = OrganizationSummaries[number]

interface Props {
  activeOrg: OrgSummaryItem
  orgsList: OrganizationSummaries
}
export const OrgDropdown: FC<Props> = ({activeOrg, orgsList}) => {
  const switchOrg = (org: SubMenuItem) => {
    window.location.href = `/orgs/${org.id}`
  }

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
      largeListSearch={true}
      largeListCeiling={25}
      selectedOption={activeOrg}
      options={orgMainMenu}
      subMenuOptions={orgsList}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Organization"
      searchText="Search Organizations"
      style={{width: 'auto'}}
      menuStyle={{width: '200px'}}
      onSelectOption={switchOrg}
    />
  )
}

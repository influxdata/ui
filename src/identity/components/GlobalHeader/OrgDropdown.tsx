import React, {FC, useState, useEffect} from 'react'
import {MenuDropdown, SubMenuItem} from '@influxdata/clockface'
import {IconFont} from '@influxdata/clockface'

interface Props {
  activeOrg
  // We likely don't need to 'set' active or if it's done by setting window.location.
  setActiveOrg: Function
  orgsList
}

export const OrgDropdown: FC<Props> = ({activeOrg, setActiveOrg, orgsList}) => {
  // We should check whether this information needs to be in state at all, since page is reloaded
  // after each click to a new 'account' or 'organization' at this stage.
  const switchOrg = (org: SubMenuItem) => {
    window.location.href = `/orgs/${org.id}`
  }

  const orgHrefOptions = [
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
      // Check largelist ceiling settings
      largeListSearch={true}
      largeListCeiling={25}
      selectedOption={activeOrg}
      options={orgHrefOptions}
      subMenuOptions={orgsList}
      menuHeaderIcon={IconFont.Switch_New}
      menuHeaderText="Switch Organization"
      searchText="Search Organizations"
      // style={{width: 'auto'}}
      menuStyle={{width: '200px'}}
      onSelectOption={switchOrg}
    />
  )
}

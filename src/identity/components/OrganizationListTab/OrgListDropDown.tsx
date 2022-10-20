import React, {FC} from 'react'
import {Dropdown} from '@influxdata/clockface'
import {
  OrgListSortMethod,
  orgListSortMethods,
} from 'src/identity/components/OrganizationListTab/OrgListMenuOptions'

interface Props {
  onClick: any
  sortMethod: OrgListSortMethod
}

export const OrgListDropdown: FC<Props> = ({onClick, sortMethod}) => {
  const menu = (onCollapse: () => void) => {
    return (
      <Dropdown.Menu onCollapse={onCollapse}>
        {orgListSortMethods.map(menuItem => (
          <Dropdown.Item
            key={`${menuItem.sortKey}--${menuItem.sortDirection}`}
            value={menuItem}
            onClick={onClick}
            testID={`account-page--org-tab-org-sorter--${menuItem.sortKey}--${menuItem.sortDirection}`}
            selected={sortMethod.label === menuItem.label}
          >
            {menuItem.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    )
  }

  return (
    <Dropdown
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          testID="account-page--org-tab-org-dropdown"
        >
          {sortMethod.label}
        </Dropdown.Button>
      )}
      menu={menu}
    ></Dropdown>
  )
}

// Libraries
import React, {FC} from 'react'

// Components
import {
  AlignItems,
  Dropdown,
  FlexBox,
  Icon,
  IconFont,
} from '@influxdata/clockface'

export const CreateOrganizationMenuItem: FC = () => {
  const handleCreateOrg = () => {
    // TODO: Enable this when #5899 is worked on
    // event('globalheader_createOrg_menuItem_clicked')
    // TODO: Remove this comment when you are working on https://github.com/influxdata/ui/issues/5899
    //       Add create organization functionality with modal, error handling and redirect to new organization
  }

  const title = 'Create Organization'
  return (
    <Dropdown.Item
      onClick={handleCreateOrg}
      className="global-header--create-org-button"
      testID={`global-header--main-dropdown-item-${title}`}
    >
      <FlexBox alignItems={AlignItems.Center}>
        <Icon glyph={IconFont.Plus_New} className="button-icon" />
        <span>{title}</span>
      </FlexBox>
    </Dropdown.Item>
  )
}

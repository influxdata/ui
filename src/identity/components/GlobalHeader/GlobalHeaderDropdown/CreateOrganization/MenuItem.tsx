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

  return (
    <Dropdown.Item
      onClick={handleCreateOrg}
      className="global-header--create-org-button"
    >
      <FlexBox alignItems={AlignItems.Center}>
        <Icon glyph={IconFont.Plus_New} className="button-icon" />
        <span>Create Organization</span>
      </FlexBox>
    </Dropdown.Item>
  )
}

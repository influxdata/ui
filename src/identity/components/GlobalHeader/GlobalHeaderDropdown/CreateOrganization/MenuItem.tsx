// Libraries
import React, {FC} from 'react'
import {
  AlignItems,
  Dropdown,
  FlexBox,
  Icon,
  IconFont,
} from '@influxdata/clockface'
import {useDispatch} from 'react-redux'

// Components
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const CreateOrganizationMenuItem: FC = () => {
  const dispatch = useDispatch()
  const handleCreateOrg = () => {
    if (isFlagEnabled('createOrgTempFlag')) {
      dispatch(
        showOverlay('create-organization', null, () =>
          dispatch(dismissOverlay())
        )
      )
    }
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

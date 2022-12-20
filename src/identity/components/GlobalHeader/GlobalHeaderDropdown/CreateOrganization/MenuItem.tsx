// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  AlignItems,
  Dropdown,
  FlexBox,
  Icon,
  IconFont,
} from '@influxdata/clockface'

// Components
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

// Selectors
import {selectCurrentAccount, selectUser} from 'src/identity/selectors'

// Eventing
import {HeaderNavEvent, multiOrgTag} from 'src/identity/events/multiOrgEvents'
import {event} from 'src/cloud/utils/reporting'

export const CreateOrganizationMenuItem: FC = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const account = useSelector(selectCurrentAccount)

  const handleCreateOrg = () => {
    event(HeaderNavEvent.CreateOrgClick, multiOrgTag, {
      userId: user.id,
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
    })
    dispatch(
      showOverlay('create-organization', null, () => dispatch(dismissOverlay()))
    )
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

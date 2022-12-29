// Libraries
import React, {FC} from 'react'
import {capitalize} from 'lodash'

// Components
import {
  IconFont,
  IndexList,
  Alignment,
  ButtonShape,
  ComponentColor,
  ComponentStatus,
  Button,
} from '@influxdata/clockface'

// Types
import {CloudUser} from 'src/types'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {useDispatch} from 'react-redux'

interface Props {
  user: CloudUser
  isDeletable: boolean
}

const formatName = (firstName: string | null, lastName: string | null) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }

  if (firstName) {
    return firstName
  }

  if (lastName) {
    return lastName
  }

  return ''
}

export const UserListItem: FC<Props> = ({user, isDeletable}) => {
  const {email, firstName, lastName, role} = user

  const dispatch = useDispatch()

  const openRemoveMemberOverlay = () => {
    dispatch(
      showOverlay('remove-member', {userToRemove: user}, () =>
        dispatch(dismissOverlay)
      )
    )
  }

  return (
    <IndexList.Row brighten={true} testID={`user-list-item ${email}`}>
      <IndexList.Cell>
        <span className="user-list-email">{email}</span>
      </IndexList.Cell>
      <IndexList.Cell>
        <span className="user-list-name">
          {formatName(firstName, lastName)}
        </span>
      </IndexList.Cell>
      <IndexList.Cell className="user-list-cell-role">
        {capitalize(role)}
      </IndexList.Cell>
      <IndexList.Cell className="user-list-cell-status">Active</IndexList.Cell>
      <IndexList.Cell alignment={Alignment.Right} revealOnHover={true}>
        {isDeletable && (
          <Button
            icon={IconFont.Trash_New}
            titleText="Remove user access"
            color={ComponentColor.Danger}
            shape={ButtonShape.Square}
            status={ComponentStatus.Valid}
            onClick={openRemoveMemberOverlay}
            testID="delete-user--button"
          />
        )}
      </IndexList.Cell>
    </IndexList.Row>
  )
}

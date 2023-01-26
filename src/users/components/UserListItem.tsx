// Libraries
import React, {FC} from 'react'
import {capitalize} from 'lodash'

// Components
import {
  Alignment,
  Button,
  ComponentColor,
  IconFont,
  IndexList,
} from '@influxdata/clockface'

// Types
import {CloudUser} from 'src/types'

interface Props {
  handleRemoveUser: (evt: React.MouseEvent<HTMLElement, MouseEvent>) => void
  isDeletable: boolean
  user: CloudUser
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

export const UserListItem: FC<Props> = ({
  user,
  handleRemoveUser,
  isDeletable,
}) => {
  const {email, firstName, lastName, role} = user

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
            color={ComponentColor.Danger}
            icon={IconFont.Trash_New}
            id={user.id}
            onClick={handleRemoveUser}
            testID="delete-user"
            titleText="Remove member access"
          />
        )}
      </IndexList.Cell>
    </IndexList.Row>
  )
}

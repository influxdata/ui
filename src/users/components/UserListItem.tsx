// Libraries
import React, {FC, useContext, useState} from 'react'
import {capitalize} from 'lodash'

// Components
import {
  IconFont,
  IndexList,
  Alignment,
  ButtonShape,
  ComponentColor,
  ConfirmationButton,
  RemoteDataState,
  ComponentStatus,
} from '@influxdata/clockface'
import {UsersContext} from 'src/users/context/users'

// Types
import {CloudUser} from 'src/types'

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
  const {removeUser, removeUserStatus} = useContext(UsersContext)

  const [revealOnHover, toggleRevealOnHover] = useState(true)

  const handleShow = () => {
    toggleRevealOnHover(false)
  }

  const handleHide = () => {
    toggleRevealOnHover(true)
  }

  const handleRemove = () => {
    removeUser(user.id)
  }

  let status = ComponentStatus.Default

  if (removeUserStatus.id === user.id) {
    status =
      removeUserStatus.status === RemoteDataState.Loading
        ? ComponentStatus.Loading
        : ComponentStatus.Default
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
      <IndexList.Cell revealOnHover={revealOnHover} alignment={Alignment.Right}>
        {isDeletable && (
          <ConfirmationButton
            icon={IconFont.Trash_New}
            onShow={handleShow}
            status={status}
            onHide={handleHide}
            confirmationLabel="Removing this member will remove their tasks and alerts."
            confirmationButtonText="Remove member access"
            titleText="Remove member access"
            confirmationButtonColor={ComponentColor.Danger}
            color={ComponentColor.Danger}
            shape={ButtonShape.Square}
            onConfirm={handleRemove}
            testID="delete-user"
          />
        )}
      </IndexList.Cell>
    </IndexList.Row>
  )
}

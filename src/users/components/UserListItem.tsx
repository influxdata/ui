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

const UserListItem: FC<Props> = ({user, isDeletable}) => {
  const {email, role} = user
  const {handleRemoveUser, removeUserStatus} = useContext(UsersContext)

  const [revealOnHover, toggleRevealOnHover] = useState(true)

  const handleShow = () => {
    toggleRevealOnHover(false)
  }

  const handleHide = () => {
    toggleRevealOnHover(true)
  }

  const handleRemove = () => {
    handleRemoveUser(user.id)
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
      {/* TODO: add back in once https://github.com/influxdata/quartz/issues/2389 back-filling of names is complete */}
      {/* <IndexList.Cell>
        <span className="user-list-name">
          {formatName(firstName, lastName)}
        </span>
      </IndexList.Cell>*/}
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
            confirmationLabel="This action will remove this user from accessing this organization"
            confirmationButtonText="Remove user access"
            titleText="Remove user access"
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

export default UserListItem

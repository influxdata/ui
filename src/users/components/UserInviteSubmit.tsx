// Libraries
import React, {FC, useContext} from 'react'

// Components
import {
  Button,
  IconFont,
  ButtonType,
  ComponentColor,
} from '@influxdata/clockface'
import {UsersContext} from 'src/users/context/users'

// Constants
import {roles} from 'src/users/constants'

const UserInviteSubmit: FC = () => {
  const {draftInvite} = useContext(UsersContext)

  const isRoleSelected = roles.includes(draftInvite.role)

  const getTitleText = () => {
    if (!draftInvite.email && !isRoleSelected) {
      return 'Please enter email and select a role'
    }

    if (!draftInvite.email) {
      return 'Please enter email'
    }

    if (!isRoleSelected) {
      return 'Please select a role'
    }

    return ''
  }

  return (
    <Button
      icon={IconFont.Plus_New}
      text="Add &amp; Invite"
      color={ComponentColor.Primary}
      type={ButtonType.Submit}
      titleText={getTitleText()}
      className="user-list-invite--button"
      testID="user-list-invite--button"
    />
  )
}

export default UserInviteSubmit

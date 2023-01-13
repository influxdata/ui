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

// Styles
const buttonStyle = {
  marginLeft: '10px',
  maxWidth: '100px',
}

export const UserInviteSubmit: FC = () => {
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
      text="Add"
      color={ComponentColor.Primary}
      style={buttonStyle}
      type={ButtonType.Submit}
      titleText={getTitleText()}
      testID="user-list-invite--button"
    />
  )
}

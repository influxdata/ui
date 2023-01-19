// Libraries
import React, {FC, useContext, useState} from 'react'
import {useSelector} from 'react-redux'

import {
  Alert,
  AlignItems,
  Button,
  ComponentColor,
  ComponentStatus,
  Dropdown,
  FlexBox,
  FlexDirection,
  Form,
  IconFont,
  Overlay,
} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Selectors
import {selectUser} from 'src/identity/selectors'

// Types
import {User} from 'src/client/unityRoutes'

export interface RemoveMemberOverlayParams {
  removeUser: Function
  users: User[]
  userToRemove: User
}

export const RemoveMemberOverlay: FC = () => {
  const {onClose, params} = useContext(OverlayContext)
  const {removeUser, users, userToRemove} = params
  const otherUsers = users.filter((user: User) => user.id !== userToRemove.id)
  const [newTasksAlertsUser, setNewTasksAlertsUser] = useState(otherUsers[0])

  const currentUserId = useSelector(selectUser).id
  const removingSelf = userToRemove.id === currentUserId

  const handleSelectTasksAlertsUser = (user: User) => {
    setNewTasksAlertsUser(user)
  }

  const handleRemoveAndTransfer = () => {
    removeUser(userToRemove.id, newTasksAlertsUser.id)

    if (removingSelf) {
      window.location.href = CLOUD_URL
    } else {
      onClose()
    }
  }

  const usersLoaded = Boolean(users.length)

  return (
    <Overlay.Container
      className="remove-member-overlay"
      maxWidth={650}
      testID="remove-member-overlay--container"
    >
      <Overlay.Header
        onDismiss={onClose}
        testID="remove-member-overlay--header"
        title={`Remove ${userToRemove.email}`}
      />
      <Overlay.Body>
        <Alert
          className="remove-member-overlay--warning-message"
          color={ComponentColor.Danger}
          icon={IconFont.AlertTriangle}
        >
          When you remove {removingSelf ? 'yourself' : 'a member'} from an
          organization, you need to transfer tasks and alerts to another member
          so that scripts are not interrupted.
        </Alert>
        <br />
        <FlexBox
          alignItems={AlignItems.FlexStart}
          className="org-delete-overlay--conditions-instruction"
          direction={FlexDirection.Row}
        >
          <Form.Element
            label={`Transfer ${userToRemove.email}'s tasks and alerts to:`}
            required={true}
          >
            {usersLoaded && (
              <Dropdown
                testID="remove-member--transfer-dropdown"
                button={(active, onClick) => (
                  <Dropdown.Button active={active} onClick={onClick}>
                    <b>{newTasksAlertsUser.email}</b>
                  </Dropdown.Button>
                )}
                menu={onCollapse => (
                  <Dropdown.Menu onCollapse={onCollapse}>
                    {otherUsers.map((user: User) => (
                      <Dropdown.Item
                        key={user.id}
                        id={user.id}
                        selected={user.id === newTasksAlertsUser.id}
                        value={user}
                        onClick={handleSelectTasksAlertsUser}
                      >
                        {user.email}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )}
              />
            )}
          </Form.Element>
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Default}
          onClick={onClose}
          testID="remove-member-form-cancel"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Danger}
          onClick={handleRemoveAndTransfer}
          status={ComponentStatus.Default}
          testID="remove-member-form-submit"
          text="Remove and Transfer"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  Alert,
  Button,
  ComponentColor,
  ComponentStatus,
  IconFont,
  Overlay,
} from '@influxdata/clockface'

// Selectors
import {getOverlayParams} from 'src/overlays/selectors'
import {selectCurrentOrg} from 'src/identity/selectors'

// Context
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {UsersContext, UsersProvider} from 'src/users/context/users'

export const RemoveMemberOverlay: FC = () => {
  return (
    <UsersProvider>
      <RemoveMemberModal />
    </UsersProvider>
  )
}

const RemoveMemberModal: FC = () => {
  const {userToRemove} = useSelector(getOverlayParams)
  const userToRemoveName = userToRemove.firstName + ' ' + userToRemove.lastName
  const userToRemoveEmail = ' (' + userToRemove.email + ')'
  const {removeUser} = useContext(UsersContext)

  const org = useSelector(selectCurrentOrg)

  const {onClose} = useContext(OverlayContext)

  const handleClickRemoveUser = async () => {
    await Promise.resolve(removeUser(userToRemove.id))
    // Need an update to the context on the page to force a refresh on removal.
    onClose()
  }

  return (
    <Overlay.Container maxWidth={750} testID="remove-member-overlay">
      <Overlay.Header
        onDismiss={onClose}
        testID="remove-member-overlay--header"
        title="Remove Member"
      />
      <Overlay.Body>
        <Alert
          color={ComponentColor.Danger}
          className="remove-member-overlay--warning-message"
          icon={IconFont.AlertTriangle}
          testID="remove-member-overlay--warning-message"
        >
          If you remove member <b>{userToRemoveName + userToRemoveEmail}</b>{' '}
          from organization <b>{org.id}</b>, any tasks or alerts created by that
          member may be interrupted.
          <br />
          <br />
          Please transfer this member's tasks or alerts, if any, to another
          member before proceeding.
        </Alert>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          color={ComponentColor.Default}
          onClick={onClose}
          testID="remove-member-overlay--cancel-button"
          text="Cancel"
        />
        <Button
          color={ComponentColor.Danger}
          onClick={handleClickRemoveUser}
          status={ComponentStatus.Default}
          testID="remove-member-overlay--submit-button"
          text={`Remove ${userToRemoveName}`}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

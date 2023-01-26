// Libraries
import React, {FC, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {Button, ComponentColor, FlexBox, IconFont} from '@influxdata/clockface'

// Selector
import {selectCurrentOrg, selectUser} from 'src/identity/selectors'

// Providers
import {UsersContext} from 'src/users/context/users'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Overlay
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

// Types
import {RemoveMemberOverlayParams} from 'src/users/components/RemoveMemberOverlay'

// Styles
import 'src/organizations/components/OrgProfileTab/style.scss'

export const LeaveOrgButton: FC = () => {
  const org = useSelector(selectCurrentOrg)
  const {users} = useContext(UsersContext)
  const currentUserId = useSelector(selectUser)?.id
  const {removeUser} = useContext(UsersContext)
  const userToRemove = users.find(user => user.id === currentUserId)
  const dispatch = useDispatch()

  const handleRemoveUser = () => {
    const params: RemoveMemberOverlayParams = {
      removeUser,
      users,
      userToRemove,
    }

    dispatch(showOverlay('remove-member', params, () => dismissOverlay()))
    window.location.href = CLOUD_URL
  }

  return (
    <>
      <FlexBox.Child>
        <h4>Leave Organization</h4>
        <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
          Leave the <b>{org.name}</b> organization.
        </p>
        <Button
          className="org-profile-tab--leaveOrgButton"
          color={ComponentColor.Default}
          icon={IconFont.Logout}
          id={currentUserId}
          onClick={handleRemoveUser}
          testID="delete-user"
          titleText="Remove member access"
        />
      </FlexBox.Child>
    </>
  )
}

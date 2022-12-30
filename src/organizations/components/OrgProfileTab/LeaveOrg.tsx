// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  ButtonShape,
  ComponentColor,
  ConfirmationButton,
  FlexBox,
  IconFont,
} from '@influxdata/clockface'

// Selector
import {
  selectCurrentOrg,
  selectUser,
} from 'src/identity/selectors'

// Providers
import {UsersContext} from 'src/users/context/users'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Styles
import 'src/organizations/components/OrgProfileTab/style.scss'

export const LeaveOrgButton: FC = () => {
  const org = useSelector(selectCurrentOrg)
  const currentUserId = useSelector(selectUser)?.id
  const {handleRemoveUser} = useContext(UsersContext)

  const handleRemove = () => {
    handleRemoveUser(currentUserId)
    window.location.href = CLOUD_URL
  }

  return (
    <>
      <FlexBox.Child>
        <h4>Leave Organization</h4>
        <p className="org-profile-tab--heading org-profile-tab--deleteHeading">
          Leave the <b>{org.name}</b> organization.
        </p>
        <ConfirmationButton
          className="org-profile-tab--leaveOrgButton"
          color={ComponentColor.Default}
          confirmationButtonColor={ComponentColor.Danger}
          confirmationButtonText="Leave Organization"
          confirmationLabel="This action will remove yourself from accessing this organization"
          icon={IconFont.Logout}
          onConfirm={handleRemove}
          shape={ButtonShape.Square}
          testID="delete-user"
          text="Leave Organization"
          titleText="Leave Organization"
        />
      </FlexBox.Child>
    </>
  )
}

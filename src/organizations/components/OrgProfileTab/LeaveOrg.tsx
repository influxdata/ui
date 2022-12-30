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
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'

// Providers
import {UsersContext} from 'src/users/context/users'

// Constants
import {CLOUD_URL} from 'src/shared/constants'

// Styles
import 'src/organizations/components/OrgProfileTab/style.scss'

export const LeaveOrgButton: FC = () => {
  const org = useSelector(getOrg)
  const currentUserId = useSelector(getMe)?.id
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
          confirmationLabel="This action will remove yourself from accessing this organization"
          confirmationButtonText="Leave Organization"
          titleText="Leave Organization"
          text="Leave Organization"
          confirmationButtonColor={ComponentColor.Danger}
          color={ComponentColor.Default}
          shape={ButtonShape.Square}
          onConfirm={handleRemove}
          testID="delete-user"
          icon={IconFont.Logout}
        />
      </FlexBox.Child>
    </>
  )
}

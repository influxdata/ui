import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

export const accountDefaultSettingError = (
  accountName: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Account "${accountName}" was not set as the default account. The default is unchanged.`,
})

export const accountDefaultSettingSuccess = (
  accountName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `Account "${accountName}" was successfully set as the default account`,
})

<<<<<<< HEAD
export const accountRenameError = (accountName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Account "${accountName}" was not renamed; the rename update failed`,
=======
// There could be more than one error here. In one case, the account isn't already teh default account
// But there could be other errors resulting from states other than starting with a non-default account.
export const accountDefaultSettingError = (
  accountName: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Account "${accountName}" was not set as the default account. The default is unchanged.`,
>>>>>>> 0f462a635 (feat: add user profile page template)
})

export const accountRenameSuccess = (
  oldAccountName: string,
  newAccountName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `Account "${oldAccountName}" was successfully renamed to "${newAccountName}"`,
})

<<<<<<< HEAD
=======
export const accountRenameError = (accountName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Account "${accountName}" was not renamed; the rename update failed`,
})

export const orgCreateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Organization was successfully created',
})

export const orgCreateFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create organization',
})

export const orgDefaultSettingSuccess = (orgName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Organization "${orgName}" was successfully set as the default organization`,
})

export const orgDefaultSettingError = (orgName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Organization "${orgName}" could not be set as the default organization. Please try again.`,
})

export const orgEditSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Organization was successfully updated',
})

export const orgEditFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to update organization',
})

export const orgRenameSuccess = (orgName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Organization was successfully renamed "${orgName}"`,
})

export const orgRenameFailed = (orgName): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update organization "${orgName}"`,
})

export const memberAddSuccess = (username: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Member "${username}" was added successfully`,
})

export const memberAddFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add members: "${message}"`,
})

export const memberRemoveSuccess = (memberName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Member "${memberName}" was removed successfully`,
})

export const memberRemoveFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to remove members: "${message}"`,
})

/* USERS NOTIFICATIONS */
export const inviteSent = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Invitation Sent`,
})

>>>>>>> 0f462a635 (feat: add user profile page template)
export const inviteFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `invite failed`,
})

export const invitationResentFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Error sending invitation`,
})

export const invitationResentSuccessful = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Invitation Re-sent`,
})

export const inviteSent = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Invitation Sent`,
})

export const invitationWithdrawnFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Error withdrawing invite, try again`,
})

export const invitationWithdrawnSuccessful = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Invitation Withdrawn`,
})

export const memberAddFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add members: "${message}"`,
})

export const memberAddSuccess = (username: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Member "${username}" was added successfully`,
})

export const memberRemoveFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to remove members: "${message}"`,
})

export const memberRemoveSuccess = (memberName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Member "${memberName}" was removed successfully`,
})

export const orgCreateFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create organization',
})

export const orgCreateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Organization was successfully created',
})

export const orgDefaultSettingError = (orgName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Organization "${orgName}" could not be set as the default organization. Please try again.`,
})

export const orgDefaultSettingSuccess = (orgName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Organization "${orgName}" was successfully set as the default organization`,
})

export const orgEditFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to update organization',
})

export const orgEditSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Organization was successfully updated',
})

export const orgRenameFailed = (orgName): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update organization "${orgName}"`,
})

export const orgRenameSuccess = (orgName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Organization was successfully renamed "${orgName}"`,
})

export const removeUserFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Error removing user, try again`,
})

<<<<<<< HEAD
export const removeUserSuccessful = (): Notification => ({
  ...defaultSuccessNotification,
  message: `User Removed`,
=======
// These should be removed from the users section and go further up in this file.
export const updateIdentityFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Error retrieving user identity. Please refresh this page.',
>>>>>>> 0f462a635 (feat: add user profile page template)
})

export const updateBillingFailed = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'Error retrieving account billing provider. Please refresh this page.',
})

export const updateIdentityFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Error retrieving user identity. Please refresh this page.',
})

export const updateOrgFailed = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'Error retrieving new organization information. Please refresh this page.',
})

export const updateQuartzOrganizationsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'We were unable to retrieve the list of your InfluxData organizations. Please refresh this page.',
})

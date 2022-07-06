import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

export const accountDefaultSettingSuccess = (
  accountName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `Account "${accountName}" was successfully set as the default account`,
})

export const accountDefaultSettingError = (
  accountName: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Account "${accountName}" was not set as the default account; the default is unchanged`,
})

export const accountRenameSuccess = (
  oldAccountName: string,
  newAccountName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `Account "${oldAccountName}" was successfully renamed to "${newAccountName}"`,
})

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

export const inviteFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `invite failed`,
})

export const invitationResentSuccessful = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Invitation Re-sent`,
})

export const invitationResentFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Error sending invitation`,
})

export const invitationWithdrawnSuccessful = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Invitation Withdrawn`,
})

export const invitationWithdrawnFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Error withdrawing invite, try again`,
})

export const removeUserSuccessful = (): Notification => ({
  ...defaultSuccessNotification,
  message: `User Removed`,
})

export const removeUserFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Error removing user, try again`,
})

export const updateIdentityFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Error retrieving user identity. Please refresh this page.',
})

export const updateBillingFailed = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'Error retrieving account billing provider. Please refresh this page.',
})

export const updateOrgFailed = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'Error retrieving new organization information. Please refresh this page.',
})

export const updateQuartzOrganizationsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'Error retrieving organizations available to this account. Please refresh this page.',
})

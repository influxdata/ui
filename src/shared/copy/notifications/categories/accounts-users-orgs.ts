// Libraries
import {IconFont} from '@influxdata/clockface'

// Constants
import {FIFTEEN_SECONDS} from 'src/shared/constants'

// Notifications
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

// Types
import {
  Notification,
  NotificationButtonElement,
  NotificationStyle,
} from 'src/types'

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

export const accountRenameError = (accountName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Account "${accountName}" was not renamed; the rename update failed`,
})

export const accountRenameSuccess = (
  oldAccountName: string,
  newAccountName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `Account "${oldAccountName}" was successfully renamed to "${newAccountName}"`,
})

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

export const marketoLoadFailure = (
  buttonElement: NotificationButtonElement
): Notification => ({
  ...defaultErrorNotification,
  message: 'Unable to load in-app contact form. ',
  buttonElement,
})

export const marketoFormSubmitFailure = (
  buttonElement: NotificationButtonElement
): Notification => ({
  ...defaultErrorNotification,
  message: 'Submission failed. ',
  buttonElement,
})

export const marketoFormSubmitSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Your account upgrade inquiry has been submitted.',
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

export const quartzOrgCreateSuccess = (
  orgName: string,
  switchToOrgLink?: NotificationButtonElement
): Notification => {
  const notification = {
    ...defaultSuccessNotification,
    message: `Organization "${orgName}" created.`,
    duration: FIFTEEN_SECONDS,
  }

  if (switchToOrgLink) {
    notification.buttonElement = switchToOrgLink
  }

  return notification
}

export const quartzOrgQuotaReached = (): Notification => ({
  ...defaultSuccessNotification,
  style: NotificationStyle.Primary,
  styles: {maxWidth: '360px'},
  icon: IconFont.Info_New,
  duration: FIFTEEN_SECONDS,
  message: `You've reached the organization quota for this account. Upgrade to add more organizations.`,
})

export const removeUserFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Error removing user, try again`,
})

export const removeUserSuccessful = (): Notification => ({
  ...defaultSuccessNotification,
  message: `User Removed`,
})

export const userProfileSaveSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Saved changes to your profile.',
})

export const userProfileSaveError = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to save all changes to your profile. Please try again.',
})

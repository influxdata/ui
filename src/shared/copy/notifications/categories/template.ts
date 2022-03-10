import {Notification} from 'src/types'
import {INDEFINITE} from 'src/shared/constants/index'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
  defaultDeletionNotification,
} from 'src/shared/copy/notifications'

// Templates

export const importDashboardSucceeded = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Successfully imported dashboard.`,
})

export const importDashboardFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to import dashboard: ${error}`,
})

export const importTemplateFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to import template: ${error}`,
})

export const createTemplateFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to  resource as template: ${error}`,
})

export const updateTemplateFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update template: ${error}`,
})

export const resourceSavedAsTemplate = (
  resourceName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `Successfully saved ${resourceName.toLowerCase()} as template.`,
})

export const saveResourceAsTemplateFailed = (
  resourceName: string,
  error: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to save ${resourceName.toLowerCase()} as template: ${error}`,
})

export const communityTemplateInstallSucceeded = (
  templateName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `We've successfully installed: ${templateName}`,
})

export const communityTemplateInstallFailed = (): Notification => ({
  ...defaultErrorNotification,
  duration: INDEFINITE,
  message: 'There was a problem installing the template. Please try again.',
})

export const communityTemplateDeleteSucceeded = (
  templateName: string
): Notification => ({
  ...defaultDeletionNotification,
  message: `We've successfully deleted: ${templateName}`,
})

export const communityTemplateDeleteFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'We were unable to delete the template. Please try again.',
})

export const communityTemplateFetchStackFailed = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'We could not fetch your installed resources. Please reload the page to try again.',
})

export const communityTemplateUnsupportedFormatError = (): Notification => ({
  ...defaultErrorNotification,
  message: `Please provide a link to a template file`,
})

export const communityTemplateRenameFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `We've successfully installed your template but weren't able to name it properly. It may appear as a blank template.`,
})

import {Notification, NotificationStyle} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

export const editCheckCodeWarning = (): Notification => ({
  ...defaultErrorNotification,
  style: NotificationStyle.Info,
  message:
    'Changes to Check code may prevent you from editing the Check in the visual editing experience.',
})

export const editNotificationRuleCodeWarning = (): Notification => ({
  ...defaultErrorNotification,
  style: NotificationStyle.Info,
  message:
    'Changes to Notification Rule code may prevent you from editing the Notification Rule in the visual editing experience.',
})

export const getChecksFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get checks: ${message}`,
})

export const getCheckFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get check: ${message}`,
})

export const getNotificationRulesFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get notification rules: ${message}`,
})

export const getNotificationRuleFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get notification rule: ${message}`,
})

export const createCheckFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create check: ${message}`,
})

export const updateCheckFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update check: ${message}`,
})

export const deleteCheckFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete check: ${message}`,
})

export const createRuleFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create notification rule: ${message}`,
})

export const updateRuleFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update notification rule: ${message}`,
})

export const deleteRuleFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete notification rule: ${message}`,
})

export const getViewFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to load resources for cell: ${message}`,
})

export const getEndpointFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get endpoint: ${message}`,
})

export const getEndpointsFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get endpoints: ${message}`,
})

export const createEndpointFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create endpoint: ${message}`,
})

export const updateEndpointFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update endpoint: ${message}`,
})

export const deleteEndpointFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete endpoint: ${message}`,
})

export const testNotificationSuccess = (
  source: 'slack' | 'pagerduty' | 'https'
): Notification => ({
  ...defaultSuccessNotification,
  message: `A test alert has been sent to ${source}`,
})

export const testNotificationFailure = (
  reason: string = 'flux was invalid.'
): Notification => ({
  ...defaultErrorNotification,
  message: `Test failed: ${reason}`,
})

export const exportAlertToTaskSuccess = (
  source: 'slack' | 'pagerduty' | 'https'
): Notification => ({
  ...defaultSuccessNotification,
  message: `Successfully created task for ${source} alert.`,
})

export const exportAlertToTaskFailure = (
  source: 'slack' | 'pagerduty' | 'https'
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create task for ${source} alert. Please check your configuration.`,
})

export const getResourcesTokensFailure = (
  tokenType: string = 'that token'
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch all resources for creating ${tokenType}`,
})

export const getFluxPackagesFailed = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch flux functions: ${message}`,
})

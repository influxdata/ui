// Libraries
import {binaryPrefixFormatter} from '@influxdata/giraffe'

// Types
import {
  Notification,
  NotificationStyle,
  NotificationButtonElement,
} from 'src/types'

// Constants
import {
  FIVE_SECONDS,
  TEN_SECONDS,
  FIFTEEN_SECONDS,
  INDEFINITE,
} from 'src/shared/constants/index'
import {QUICKSTART_SCRAPER_TARGET_URL} from 'src/dataLoaders/constants/pluginConfigs'
import {QUICKSTART_DASHBOARD_NAME} from 'src/onboarding/constants/index'
import {IconFont} from '@influxdata/clockface'

const bytesFormatter = binaryPrefixFormatter({
  suffix: 'B',
  significantDigits: 2,
  trimZeros: true,
})

type NotificationExcludingMessage = Pick<
  Notification,
  Exclude<keyof Notification, 'message'>
>

const defaultButtonElement = () => null

const defaultErrorNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Error,
  icon: IconFont.AlertTriangle_New,
  duration: TEN_SECONDS,
}

const defaultWarningNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Warning,
  icon: IconFont.Group,
  duration: TEN_SECONDS,
}

const defaultSuccessNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Success,
  icon: IconFont.Checkmark_New,
  duration: FIVE_SECONDS,
}

const defaultDeletionNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Primary,
  icon: IconFont.Trash_New,
  duration: FIVE_SECONDS,
}

//  Misc Notifications
//  ----------------------------------------------------------------------------

export const prohibitedDeselect = (message?: string): Notification => ({
  ...defaultErrorNotification,
  message:
    message ?? 'You must have at least one custom aggregate function selected',
})

export const newVersion = (version: string): Notification => ({
  ...defaultSuccessNotification,
  style: NotificationStyle.Info,
  icon: IconFont.Cubouniform,
  message: `Welcome to the latest Chronograf${version}. Local settings cleared.`,
})

export const loadLocalSettingsFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Loading local settings failed: ${error}`,
})

export const presentationMode = (): Notification => ({
  ...defaultSuccessNotification,
  style: NotificationStyle.Primary,
  icon: IconFont.ExpandB,
  duration: 7500,
  message: 'Press ESC to exit Presentation Mode.',
})

export const sessionTimedOut = (): Notification => ({
  ...defaultSuccessNotification,
  style: NotificationStyle.Primary,
  icon: IconFont.Triangle,
  duration: FIFTEEN_SECONDS,
  message: 'Your session has timed out. Log in again to continue.',
})

export const resultTooLarge = (bytesRead: number): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Large response truncated to first ${bytesFormatter(bytesRead)}`,
})

// Checkout Notifications
export const submitError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message:
    'There was an error submitting the upgrade request, please try again.',
})

export const getBillingSettingsError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your billing settings: ${message}`,
})

// Billing Notifications
export const updateBillingSettingsError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error updating your billing settings: ${message}`,
})

export const getInvoicesError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your invoices: ${message}`,
})

export const getMarketplaceError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your marketplace details: ${message}`,
})

export const getBillingInfoError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your billing info: ${message}`,
})

export const updateBillingInfoError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error updating your billing info: ${message}`,
})

export const billingContactIncompleteError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message:
    'Looks like your billing information is incomplete. Please complete the form before resubmitting.',
})

export const updatePaymentMethodError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error updating your payment method: ${message}`,
})

export const accountCancellationError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error cancelled your account: ${message}`,
})

// Operator Notifications
export const getOrgsError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message:
    'There was an error getting the all the organizations, please try again.',
})

export const getOrgError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not find organization with ID ${id}`,
})

export const getLimitsError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not fetch limits for the organization ${id}`,
})

export const updateLimitsError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not update limits for the organization ${id}`,
})

export const updateLimitsSuccess = (id: string): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: `Successfully updated limits for the organization ${id}`,
})

export const getAccountsError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: 'There was an error getting the all the accounts, please try again.',
})

export const getAccountError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not get the account for ID: ${id}`,
})

export const deleteAccountError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to delete the account with the ID ${id}, please try again.`,
})

export const removeUserAccountError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to remove the user from the account with the ID ${id}, please try again.`,
})

// Onboarding notifications
export const SetupSuccess: Notification = {
  ...defaultSuccessNotification,
  message: 'Initial user details have been successfully set',
}

export const SetupError = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Could not set up admin user: ${message}`,
})

export const SigninError: Notification = {
  ...defaultErrorNotification,
  message: `Could not sign in`,
}

export const checkStatusLoading: Notification = {
  ...defaultSuccessNotification,
  message: `Currently loading checks`,
}

export const QuickstartScraperCreationSuccess: Notification = {
  ...defaultSuccessNotification,
  message: `The InfluxDB Scraper has been configured for ${QUICKSTART_SCRAPER_TARGET_URL}`,
}

export const QuickstartScraperCreationError: Notification = {
  ...defaultErrorNotification,
  message: `Failed to configure InfluxDB Scraper`,
}

export const QuickstartDashboardCreationSuccess: Notification = {
  ...defaultSuccessNotification,
  message: `The ${QUICKSTART_DASHBOARD_NAME} Dashboard has been created`,
}

export const QuickstartDashboardCreationError: Notification = {
  ...defaultErrorNotification,
  message: `Failed to create ${QUICKSTART_DASHBOARD_NAME} Dashboard`,
}

export const TelegrafConfigCreationSuccess: Notification = {
  ...defaultSuccessNotification,
  message: `Your configurations have been saved`,
}

export const TelegrafConfigCreationError: Notification = {
  ...defaultErrorNotification,
  message: `Failed to save configurations`,
}

export const TokenCreationError: Notification = {
  ...defaultErrorNotification,
  message: `Failed to create a new Telegraf API Token`,
}

//  Task Notifications
//  ----------------------------------------------------------------------------
export const addTaskLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to add label to task',
})

export const removeTaskLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to remove label from task',
})

//  Dashboard Notifications

export const dashboardGetFailed = (
  dashboardID: string,
  error: string
): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.DashH,
  message: `Failed to load dashboard with id "${dashboardID}": ${error}`,
})

export const dashboardsGetFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.DashH,
  message: `Failed to retrieve dashboards: ${error}`,
})

export const dashboardUpdateFailed = (): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.DashH,
  message: 'Could not update dashboard',
})

export const dashboardDeleted = (name: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.DashH,
  message: `Dashboard ${name} deleted successfully.`,
})

export const dashboardCreateFailed = () => ({
  ...defaultErrorNotification,
  message: 'Failed to create dashboard.',
})

export const dashboardCreateSuccess = () => ({
  ...defaultSuccessNotification,
  message: 'Created dashboard successfully',
})

export const dashboardDeleteFailed = (
  name: string,
  errorMessage: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete Dashboard ${name}: ${errorMessage}.`,
})

export const dashboardCopySuccess = () => ({
  ...defaultSuccessNotification,
  message: 'Copied dashboard to the clipboard!',
})

export const dashboardCopyFailed = () => ({
  ...defaultErrorNotification,
  message: 'Failed to copy dashboard.',
})

export const cellAdded = (
  cellName?: string,
  dashboardName?: string
): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.DashH,
  message: `Added new cell ${cellName + ' '}to dashboard ${dashboardName}`,
})

export const cellAddFailed = (
  message: string = 'unknown error'
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add cell: ${message}`,
})

export const cellCloneSuccess = (
  destinationDashboardID: string,
  operationType: string,
  cellName?: string
): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.DashH,
  message: `Cell ${cellName ??
    ''} successfully ${operationType} to dashboard with id ${destinationDashboardID}`,
})

export const cellCopyFailed = (err?: string): Notification => ({
  ...defaultErrorNotification,
  message: `Cell copy failed: ${err}`,
})

export const cellUpdateFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update cell`,
})

export const cellDeleted = (): Notification => ({
  ...defaultDeletionNotification,
  icon: IconFont.DashH,
  duration: 1900,
  message: `Cell deleted from dashboard.`,
})

export const addDashboardLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to add label to dashboard',
})

export const removedDashboardLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to remove label from dashboard',
})

// Variables & URL Queries
export const invalidTimeRangeValueInURLQuery = (): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Invalid URL query value supplied for lower or upper time range.`,
})

export const invalidVariableNameValuePairInURLQuery = (
  name: string,
  value: string
): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Invalid URL query value "${value}" supplied for variable name "${name}".`,
})

export const getVariablesFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch variables',
})

export const getVariableFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch variable',
})

export const getVariableFailedWithMessage = (name, message): Notification => ({
  ...defaultErrorNotification,
  duration: INDEFINITE,
  message: `Failed to fetch variable ${name}: ${message}`,
})

export const createVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to create variable: ${error}`,
})

export const createVariableSuccess = (name: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: `Successfully created new variable: ${name}.`,
})

export const deleteVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to delete variable: ${error}`,
})

export const deleteVariableSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: 'Successfully deleted the variable',
})

export const updateVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to update variable: ${error}`,
})

export const updateVariableSuccess = (name: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: `Successfully updated variable: ${name}.`,
})

export const moveVariableFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to move variable: ${error}`,
})

export const copyToClipboardSuccess = (
  text: string,
  title: string = ''
): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  type: 'copyToClipboardSuccess',
  message: `${title} '${text}' has been copied to clipboard.`,
})

export const copyToClipboardFailed = (
  text: string,
  title: string = ''
): Notification => ({
  ...defaultErrorNotification,
  message: `${title}'${text}' was not copied to clipboard.`,
})

// Templates
export const TelegrafDashboardCreated = (configs: string[]): Notification => ({
  ...defaultSuccessNotification,
  message: `Successfully created dashboards for telegraf plugin${
    configs.length > 1 ? 's' : ''
  }: ${configs.join(', ')}.`,
})

export const TelegrafDashboardFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Could not create dashboards for one or more plugins`,
})

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

// Labels
export const getLabelsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch labels',
})

export const createLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create label',
})

export const updateLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to update label',
})

export const deleteLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to delete label',
})

// Secrets
export const getSecretsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch secrets',
})

export const createSecretFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create secret',
})

export const upsertSecretFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create or update secret',
})

export const deleteSecretsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to delete secret',
})

// Buckets
export const getBucketsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch buckets',
})

export const getBucketFailed = (
  bucketID: string,
  error: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch bucket with id ${bucketID}: ${error}`,
})

export const getSchemaFailed = (
  bucketName: string,
  error: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch schema for bucket with id ${bucketName}: ${error}`,
})

export const updateAggregateType = (
  message: string,
  buttonElement?: NotificationButtonElement
): Notification => ({
  ...defaultErrorNotification,
  message,
  buttonElement,
  duration: TEN_SECONDS,
  type: 'aggregateTypeError',
})

// Limits
export const readWriteCardinalityLimitReached = (
  message: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to write data due to plan limits: ${message}`,
  duration: FIVE_SECONDS,
  type: 'readWriteCardinalityLimitReached',
})

export const readLimitReached = (): Notification => ({
  ...defaultErrorNotification,
  message: `Exceeded query limits.`,
  duration: FIVE_SECONDS,
  type: 'readLimitReached',
})

export const rateLimitReached = (secs?: number): Notification => {
  const retryText = ` Please try again in ${secs} seconds`
  return {
    ...defaultErrorNotification,
    message: `Exceeded rate limits.${secs ? retryText : ''} `,
    duration: FIVE_SECONDS,
    type: 'rateLimitReached',
  }
}

export const writeLimitReached = (
  message: string,
  Button: any,
  duration?: number
) => ({
  ...defaultErrorNotification,
  message,
  duration: duration ?? TEN_SECONDS,
  type: 'writeLimitReached',
  style: NotificationStyle.Secondary,
  buttonElement: () => Button,
})

export const resourceLimitReached = (resourceName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Oops. It looks like you have reached the maximum number of ${resourceName} allowed as part of your plan. If you would like to upgrade and remove this restriction, reach out to support@influxdata.com.`,
  duration: FIVE_SECONDS,
  type: 'resourceLimitReached',
})

export const queryCancelRequest = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Query cancelled.`,
})

export const taskNotCreated = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create new task: ${additionalMessage}`,
})

export const taskCreatedSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'New task created successfully',
})

export const taskNotFound = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to find task: ${additionalMessage}`,
})

export const tasksFetchFailed = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get tasks from server: ${additionalMessage}`,
})

export const taskDeleteFailed = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete task: ${additionalMessage}`,
})

export const taskDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Task was deleted successfully',
})

export const taskCloneSuccess = (taskName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Successfully cloned task ${taskName}`,
})

export const taskCloneFailed = (
  taskName: string,
  additionalMessage: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to clone task ${taskName}: ${additionalMessage} `,
})

export const taskUpdateFailed = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update task: ${additionalMessage}`,
})

export const taskUpdateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Task was updated successfully',
})

export const taskImportFailed = (errorMessage: string): Notification => ({
  ...defaultErrorNotification,
  duration: undefined,
  message: `Failed to import Task: ${errorMessage}.`,
})

export const taskImportSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: `Successfully imported task.`,
})

export const taskRunSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: 'Task scheduled successfully',
})

export const taskRunFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to run task: ${error}`,
})

export const taskGetFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to get runs: ${error}`,
})

export const taskRetrySuccess = (id: string): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: `Task run ${id} successfully scheduled`,
})

export const taskRetryFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to retry Task: ${error}`,
})

export const getTelegrafConfigFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to get telegraf config',
})

export const savingNoteFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to save note: ${error}`,
})

export const bucketDeleteFailed = (bucketName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete bucket: "${bucketName}"`,
})

export const bucketDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Bucket was deleted successfully',
})

export const predicateDeleteFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to delete data with predicate',
})

export const setFilterKeyFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to set the filter key tag',
})

export const setFilterValueFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to set the filter value tag',
})

export const bucketCreateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Bucket was successfully created',
})

export const bucketCreateFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create bucket: ${error}`,
})

export const bucketUpdateSuccess = (bucketName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Bucket "${bucketName}" was successfully updated`,
})

export const predicateDeleteSucceeded = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Successfully deleted data with predicate!',
})

export const measurementSchemaAdditionSuccessful = (
  bucketName: string,
  schemaName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `MeasurementSchema ${schemaName}  has been successfully added to bucket ${bucketName}`,
})

export const measurementSchemaUpdateSuccessful = (
  measurementName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `MeasurementSchema ${measurementName}  has been successfully updated`,
})

export const bucketUpdateFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update bucket: "${error}"`,
})

export const measurementSchemaAdditionFailed = (
  bucketName: string,
  schemaName: string,
  errorMsg: string
): Notification => ({
  ...defaultErrorNotification,
  message: `MeasurementSchema ${schemaName}  has *not* been successfully added to bucket ${bucketName}, error: ${errorMsg}`,
})

export const measurementSchemaUpdateFailed = (
  measurementName: string,
  errorMsg: string
): Notification => ({
  ...defaultErrorNotification,
  message: `MeasurementSchema ${measurementName}  has *not* been successfully updated, error: ${errorMsg}`,
})

export const bucketRenameSuccess = (bucketName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Bucket was successfully renamed "${bucketName}"`,
})

export const bucketRenameFailed = (bucketName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to rename bucket "${bucketName}"`,
})

export const addBucketLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to add label to bucket',
})

export const removeBucketLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to remove label from bucket',
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

export const scraperDeleteSuccess = (scraperName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Scraper "${scraperName}" was successfully deleted`,
})

export const scraperDeleteFailed = (scraperName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete scraper: "${scraperName}"`,
})

export const scraperCreateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Scraper was created successfully',
})

export const scraperCreateFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create scraper',
})

export const scraperUpdateSuccess = (scraperName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Scraper "${scraperName}" was updated successfully`,
})

export const scraperUpdateFailed = (scraperName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update scraper: "${scraperName}"`,
})

export const telegrafGetFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to get telegraf configs',
})

export const telegrafCreateFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create telegraf',
})

export const telegrafUpdateFailed = (telegrafName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update telegraf: "${telegrafName}"`,
})

export const addTelegrafLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add label to telegraf config`,
})

export const removeTelegrafLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to remove label from telegraf config`,
})

export const authorizationsGetFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to get API tokens',
})

export const authorizationCreateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token was created successfully',
})

export const passwordResetSuccessfully = (message: string): Notification => ({
  ...defaultSuccessNotification,
  message: `${message}
  If you haven't received an email, please ensure that the email you provided is correct.`,
})

export const authorizationCreateFailed = (
  errorMessage?: string
): Notification => {
  const defaultMsg = 'Failed to create API tokens'
  const message = errorMessage ? `${defaultMsg}: ${errorMessage}` : defaultMsg
  return {
    ...defaultErrorNotification,
    message,
  }
}

export const authorizationUpdateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token was updated successfully',
})

export const authorizationUpdateFailed = (desc: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update API token: "${desc}"`,
})

export const authorizationDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token was deleted successfully',
})

export const authorizationDeleteFailed = (desc: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete API token: "${desc}"`,
})

export const authorizationCopySuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token has been copied to clipboard',
})

export const authorizationCopyFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to copy API token to clipboard',
})

export const telegrafDeleteSuccess = (telegrafName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Telegraf "${telegrafName}" was deleted successfully`,
})

export const telegrafDeleteFailed = (telegrafName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete telegraf: "${telegrafName}"`,
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

export const addVariableLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add label to variables`,
})

export const removeVariableLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to remove label from variables`,
})

export const invalidMapType = (): Notification => ({
  ...defaultErrorNotification,
  message: `Variables of type map accept two comma separated values per line`,
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

export const invalidJSON = (message: string): Notification => {
  return {
    ...defaultErrorNotification,
    message: message
      ? `We couldn’t parse the JSON you entered because it failed with message:\n'${message}'`
      : 'We couldn’t parse the JSON you entered because it isn’t valid. Please check the formatting and try again.',
  }
}

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

// Notebooks

export const notebookRunSuccess = (projectName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `${projectName} run successful!`,
})

export const notebookRunFail = (projectName: string): Notification => ({
  ...defaultErrorNotification,
  message: `${projectName} run failed`,
})

export const notebookCreateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create Notebook, please try again.`,
})

export const notebookUpdateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to save changes to Notebook, please try again.`,
})

export const notebookDeleteFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete Notebook, please try again.`,
})

export const notebookDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Notebook was deleted successfully',
})

export const csvUploaderErrorNotification = (
  message: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to upload the selected CSV: ${message}`,
})

export const csvUploadCancelled = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Successfully cancelled CSV Upload',
})

// Functions
export const functionGetFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch functions`,
})

export const functionCreateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create function. Please try again`,
})

export const functionDeleteFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete function. Please try again`,
})

export const functionTriggerFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to trigger function run. Please try again`,
})

export const runGetFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch runs for this function`,
})

export const functionUpdateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to save function. Please try again`,
})

export const copyFunctionURL = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Copied function URL to clipboard`,
  duration: 2000,
})

export const deleteAnnotationSuccess = (message: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  message: message
    ? `Successfully deleted the annotation: ${message}`
    : 'Successfully deleted the annotation',
})

export const deleteAnnotationFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to delete annotation: ${error}`,
})

export const editAnnotationSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Checkmark_New,
  message: 'Annotation updated successfully',
})

export const editAnnotationFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to edit annotation: ${error}`,
})

export const createAnnotationFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `Failed to create annotation: ${error}`,
})

export const annotationsUnsupportedOnGraph = (
  graphType: string = 'This graph type'
): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Cube,
  message: `${graphType} does not support adding annotations.`,
})

export const dashboardAutoRefreshTimeoutSuccess = (
  time?: string
): Notification => ({
  ...defaultSuccessNotification,
  duration: INDEFINITE,
  icon: IconFont.Clock_New,
  message: `Your dashboard auto refresh settings have been reset due to inactivity ${
    time ? 'over the last' + time : ''
  }`,
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

/* Billing Notifications */
export const zuoraParamsGetFailure = (message): Notification => ({
  ...defaultErrorNotification,
  message,
})

export const accountSelfDeletionFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `There was an error deleting the organization, please try again.`,
})

export const deleteAccountWarning = (buttonElement): Notification => ({
  ...defaultWarningNotification,
  message: `All additional users must be removed from the Organization before the account can be deleted.\n`,
  buttonElement,
  styles: {
    flexWrap: 'wrap',
  },
})

export const pinnedItemFailure = (
  error: string,
  failureType: string
): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.Star,
  message: `Failed to ${failureType} pinned item: ${error}`,
})

export const pinnedItemSuccess = (
  pinItemType: string,
  pinAction: string
): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Star,
  message: `Successfully ${pinAction} pinned ${pinItemType} to homepage`,
})

export const testNotificationSuccess = (
  source: 'slack' | 'pagerduty' | 'https'
): Notification => ({
  ...defaultSuccessNotification,
  message: `A test alert has been sent to ${source}`,
})

export const testNotificationFailure = (
  source: 'slack' | 'pagerduty' | 'https'
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to send the test alert to ${source}. Please try again`,
})

export const getResourcesTokensFailure = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch all resources for creating custom api token',
})

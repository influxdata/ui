import {Notification} from 'src/types'
import {
  defaultSuccessNotification,
  defaultErrorNotification,
} from 'src/shared/copy/notifications'
import {QUICKSTART_SCRAPER_TARGET_URL} from 'src/dataLoaders/constants/pluginConfigs'
import {QUICKSTART_DASHBOARD_NAME} from 'src/onboarding/constants/index'

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

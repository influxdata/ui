import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

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

export const cloneTelegrafSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Telegraf configuration was cloned successfully`,
})

export const addTelegrafLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add label to telegraf config`,
})

export const removeTelegrafLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to remove label from telegraf config`,
})

export const telegrafDeleteSuccess = (telegrafName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Telegraf "${telegrafName}" was deleted successfully`,
})

export const telegrafDeleteFailed = (telegrafName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete telegraf: "${telegrafName}"`,
})

export const getTelegrafConfigFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to get telegraf config',
})

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

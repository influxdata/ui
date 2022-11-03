import {Notification} from 'src/types'
import {defaultErrorNotification} from 'src/shared/copy/notifications'

export const fetchOrgAllowanceFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Cannot determine whether more organizations can be created in this account.`,
})

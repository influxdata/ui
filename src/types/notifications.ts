import {Action} from 'src/shared/actions/notifications'
import {IconFont} from '@influxdata/clockface'

export type NotificationAction = Action

export interface Notification {
  id?: string
  style: NotificationStyle
  icon: IconFont
  duration?: number
  message: string
  buttonElement?: JSX.Element
  // We probably do not need type here
  // It is not being read anywhere, seems like metadata?
  type?: string
  aggregateType?: boolean
}

export enum NotificationStyle {
  Error = 'error',
  Success = 'success',
  Info = 'info',
  Primary = 'primary',
  Warning = 'warning',
}

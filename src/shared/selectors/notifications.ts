import {AppState, Notification} from 'src/types'

export const getNotifications = (state: AppState): Notification[] => {
  const notifications = state.notifications || []

  return notifications
}

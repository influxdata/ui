import {produce} from 'immer'
import {nanoid} from 'nanoid'
import {Action} from 'src/shared/actions/notifications'
import {Notification} from 'src/types'

export const initialState: Notification[] = []

export const notificationsReducer = (
  state = initialState,
  action: Action
): Notification[] =>
  produce(state, draftState => {
    switch (action.type) {
      case 'PUBLISH_NOTIFICATION': {
        const {notification} = action.payload
        const publishedNotification = {
          ...notification,
          id: nanoid(),
        }
        const matchIndex = state.findIndex(
          n =>
            (n.type && notification.type && n.type === notification.type) ||
            (n.message && n.message === notification.message)
        )
        const isUnique = matchIndex === -1
        if (isUnique) {
          draftState.unshift(publishedNotification)
        }
        return
      }

      case 'DISMISS_NOTIFICATION': {
        const {id} = action.payload
        return draftState.filter(n => n.id !== id)
      }

      case 'DISMISS_ALL_NOTIFICATIONS': {
        return []
      }
    }
  })

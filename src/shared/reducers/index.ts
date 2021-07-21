import app from 'src/shared/reducers/app'
import currentDashboard from 'src/shared/reducers/currentDashboard'
import {notificationsReducer} from 'src/shared/reducers/notifications'

export default {
  app,
  currentDashboard,
  notifications: notificationsReducer,
}

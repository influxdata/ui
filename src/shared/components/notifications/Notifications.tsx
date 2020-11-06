import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {get} from 'lodash'
import {ComponentSize, Gradients, Notification} from '@influxdata/clockface'

// Utils
import {dismissNotification} from 'src/shared/actions/notifications'

// Types
import {NotificationStyle} from 'src/types'

// Selectors
import {getNotifications} from 'src/shared/selectors/notifications'

const matchGradientToColor = (style: NotificationStyle): Gradients => {
  const converter = {
    [NotificationStyle.Primary]: Gradients.Primary,
    [NotificationStyle.Warning]: Gradients.WarningLight,
    [NotificationStyle.Success]: Gradients.HotelBreakfast,
    [NotificationStyle.Error]: Gradients.DangerDark,
    [NotificationStyle.Info]: Gradients.DefaultLight,
  }
  return get(converter, style, Gradients.DefaultLight)
}

const Notifications: FC = () => {
  const notifications = useSelector(getNotifications)
  const dispatch = useDispatch()

  const handleDismiss = (id?: string): void => {
    dispatch(dismissNotification(id))
  }

  return (
    <>
      {notifications.map(
        ({duration, icon, id, message, style, buttonElement}) => {
          const gradient = matchGradientToColor(style)

          return (
            <Notification
              key={id}
              id={id}
              icon={icon}
              duration={duration}
              size={ComponentSize.ExtraSmall}
              gradient={gradient}
              onTimeout={dismissNotification}
              onDismiss={dismissNotification}
              testID={`notification-${style}`}
            >
              <span className="notification--message">{message}</span>
              {buttonElement && buttonElement(handleDismiss)}
            </Notification>
          )
        }
      )}
    </>
  )
}

export default Notifications

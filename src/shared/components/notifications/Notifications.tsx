import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {get} from 'lodash'
import {ComponentSize, Gradients, Notification} from '@influxdata/clockface'

// Utils
import {dismissNotification, notify} from 'src/shared/actions/notifications'

// Types
import {NotificationStyle} from 'src/types'

// Selectors
import {getNotifications} from 'src/shared/selectors/notifications'
import {selectCurrentAccountName} from 'src/identity/selectors'
import {getFromLocalStorage, removeFromLocalStorage} from 'src/localStorage'
import {deleteOrgSuccess} from 'src/shared/copy/notifications'

const matchGradientToColor = (style: NotificationStyle): Gradients => {
  const converter = {
    [NotificationStyle.Primary]: Gradients.Info,
    [NotificationStyle.Warning]: Gradients.WarningLight,
    [NotificationStyle.Success]: Gradients.HotelBreakfast,
    [NotificationStyle.Error]: Gradients.DangerDark,
    [NotificationStyle.Info]: Gradients.DefaultLight,
    [NotificationStyle.Secondary]: Gradients.SecondaryDark,
  }
  return get(converter, style, Gradients.DefaultLight)
}

const Notifications: FC = () => {
  const notifications = useSelector(getNotifications)
  const accountName = useSelector(selectCurrentAccountName)
  const userJustDeletedAnOrg = Boolean(getFromLocalStorage('justDeletedOrg'))

  const dispatch = useDispatch()

  useEffect(() => {
    if (
      userJustDeletedAnOrg &&
      !window.location.href.includes('org-settings')
    ) {
      const deletedOrgName = getFromLocalStorage('justDeletedOrg')
      removeFromLocalStorage('justDeletedOrg')
      dispatch(notify(deleteOrgSuccess(deletedOrgName, accountName)))
    }
  }, [accountName, dispatch, userJustDeletedAnOrg])

  return (
    <>
      {notifications.map(
        ({duration, icon, id, message, style, styles = {}, buttonElement}) => {
          const gradient = matchGradientToColor(style)

          const handleDismiss = (): void => {
            dispatch(dismissNotification(id))
          }

          return (
            <Notification
              key={id}
              id={id}
              icon={icon}
              duration={duration}
              size={ComponentSize.Small}
              gradient={gradient}
              onTimeout={handleDismiss}
              onDismiss={handleDismiss}
              testID={`notification-${style}`}
              style={{maxWidth: '600px', alignItems: 'center'}}
            >
              <span style={styles}>
                {message && (
                  <span className="notification--message">{message}</span>
                )}
                {buttonElement && buttonElement(handleDismiss)}
              </span>
            </Notification>
          )
        }
      )}
    </>
  )
}

export default Notifications

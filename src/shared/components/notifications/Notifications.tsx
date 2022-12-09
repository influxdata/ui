// Libraries
import React, {FC, useEffect} from 'react'
import {get} from 'lodash'
import {ComponentSize, Gradients, Notification} from '@influxdata/clockface'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {dismissNotification, notify} from 'src/shared/actions/notifications'

// Types
import {NotificationStyle} from 'src/types'

// Selectors
import {getNotifications} from 'src/shared/selectors/notifications'
import {selectCurrentAccount} from 'src/identity/selectors'

// Notifications
import {deleteOrgSuccess} from 'src/shared/copy/notifications'

// Utils
import {getFromLocalStorage, removeFromLocalStorage} from 'src/localStorage'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  DELETED_ORG_ID_LOCALSTORAGE_KEY,
  DELETED_ORG_NAME_LOCALSTORAGE_KEY,
} from 'src/cloud/constants'

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
  const account = useSelector(selectCurrentAccount)
  const dispatch = useDispatch()

  /* WorkAround For Notifying User When An Org Is Deleted */
  // This ensures that a user always receives a notification after deleting an organization.
  // Since quartz forces a reload to the new org, the notification trigger lives in LocalStorage.
  const justDeletedOrgName = getFromLocalStorage(
    DELETED_ORG_NAME_LOCALSTORAGE_KEY
  )
  const justDeletedOrgID = getFromLocalStorage(DELETED_ORG_ID_LOCALSTORAGE_KEY)

  const userJustDeletedAnOrg = Boolean(
    isFlagEnabled('createDeleteOrgs') &&
      justDeletedOrgName &&
      justDeletedOrgID &&
      !window.location.href.includes(justDeletedOrgID)
  )

  useEffect(() => {
    if (userJustDeletedAnOrg) {
      const deletedOrgName = justDeletedOrgName
      removeFromLocalStorage(DELETED_ORG_NAME_LOCALSTORAGE_KEY)
      removeFromLocalStorage(DELETED_ORG_ID_LOCALSTORAGE_KEY)
      dispatch(notify(deleteOrgSuccess(deletedOrgName, account.name)))
    }
  }, [account.name, dispatch, justDeletedOrgName, userJustDeletedAnOrg])
  /* End of WorkAround */

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

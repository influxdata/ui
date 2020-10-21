import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'
import {ComponentSize, Gradients, Notification} from '@influxdata/clockface'

// Utils
import {dismissNotification as dismissNotificationAction} from 'src/shared/actions/notifications'

//Types
import {AppState, NotificationStyle} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

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

class Notifications extends PureComponent<Props> {
  public static defaultProps = {
    notifications: [],
  }

  public render() {
    const {notifications} = this.props

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
                onTimeout={this.props.dismissNotification}
                onDismiss={this.props.dismissNotification}
                testID={`notification-${style}`}
              >
                <span className="notification--message">{message}</span>
                {buttonElement}
              </Notification>
            )
          }
        )}
      </>
    )
  }
}

const mstp = ({notifications}: AppState) => ({
  notifications,
})

const mdtp = {
  dismissNotification: dismissNotificationAction,
}

const connector = connect(mstp, mdtp)

export default connector(Notifications)

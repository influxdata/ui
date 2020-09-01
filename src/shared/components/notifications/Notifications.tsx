import React, {PureComponent} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'
import {
  Button,
  ComponentSize,
  Gradients,
  Notification,
} from '@influxdata/clockface'

// Utils
import {setFunctions} from 'src/timeMachine/actions/queryBuilder'
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
          ({
            aggregateType,
            duration,
            icon,
            id,
            link,
            linkText,
            message,
            style,
          }) => {
            const gradient = matchGradientToColor(style)

            let button

            if (link && linkText) {
              button = (
                <Link
                  to={link}
                  className="notification--button cf-button cf-button-xs cf-button-default"
                >
                  {linkText}
                </Link>
              )
            }

            if (aggregateType) {
              const handleClick = () => {
                this.props.onSetFunctions(['last'])
                this.props.dismissNotification(id)
              }

              button = (
                <Button text="Update Aggregate Type" onClick={handleClick} />
              )
            }

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
                {button}
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
  onSetFunctions: setFunctions,
}

const connector = connect(mstp, mdtp)

export default connector(Notifications)

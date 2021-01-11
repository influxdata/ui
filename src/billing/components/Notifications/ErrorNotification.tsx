// Libraries
import React, {FC} from 'react'
// Components
import {
  ComponentSize,
  Gradients,
  IconFont,
  Notification,
} from '@influxdata/clockface'
import {useNotify} from '../../hooks'

const ErrorNotification: FC = ({children}) => {
  const [notify, {hide}] = useNotify('visible')

  return (
    <Notification
      size={ComponentSize.Small}
      gradient={Gradients.DangerDark}
      icon={IconFont.AlertTriangle}
      onDismiss={hide}
      onTimeout={hide}
      visible={notify}
      duration={5000}
    >
      {children}
    </Notification>
  )
}

export {ErrorNotification}

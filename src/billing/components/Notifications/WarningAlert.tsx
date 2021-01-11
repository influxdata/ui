// Libraries
import React, {FC} from 'react'
// Components
import {Alert, ComponentColor, IconFont} from '@influxdata/clockface'

export const WarningAlert: FC = ({children}) => {
  return (
    <Alert color={ComponentColor.Warning} icon={IconFont.AlertTriangle}>
      {children}
    </Alert>
  )
}

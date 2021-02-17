// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

// Contexts
import {PopupContext} from 'src/flows/context/popup'

const ExportDashboardOverlayHeader: FC = () => {
  const {closeFn} = useContext(PopupContext)

  return (
    <Overlay.Header
      title="Export To Dashboard"
      onDismiss={closeFn}
      testID="export-as-overlay--header"
    />
  )
}

export default ExportDashboardOverlayHeader

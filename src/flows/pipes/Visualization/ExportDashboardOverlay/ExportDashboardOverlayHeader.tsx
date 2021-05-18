// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

// Contexts
import {PopupContext} from 'src/flows/context/popup'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ExportDashboardOverlayHeader: FC = () => {
  const {closeFn} = useContext(PopupContext)
  const closer = () => {
    event('Export Dashboard Overlay Closed')

    closeFn()
  }

  return (
    <Overlay.Header
      title="Export To Dashboard"
      onDismiss={closer}
      testID="export-as-overlay--header"
    />
  )
}

export default ExportDashboardOverlayHeader

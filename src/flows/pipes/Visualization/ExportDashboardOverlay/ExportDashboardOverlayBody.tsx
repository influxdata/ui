// Libraries
import React, {FC, useContext} from 'react'

// Components
import UpdateDashboardBody from './UpdateDashboardBody'
import CreateDashboardBody from './CreateDashboardBody'

// Contexts
import {
  Context,
  ExportToDashboard,
} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'

const ExportDashboardOverlayHeader: FC = () => {
  const {activeTab} = useContext(Context)

  if (activeTab === ExportToDashboard.Create) {
    return <CreateDashboardBody />
  }

  return <UpdateDashboardBody />
}

export default ExportDashboardOverlayHeader

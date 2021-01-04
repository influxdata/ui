// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Alignment, ComponentSize, Tabs} from '@influxdata/clockface'

// Contexts
import {
  Context,
  ExportToDashboard,
} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'

const ExportDashboardOverlayTabs: FC = () => {
  const {activeTab, handleSetActiveTab} = useContext(Context)

  return (
    <Tabs alignment={Alignment.Left} size={ComponentSize.Small}>
      <Tabs.Tab
        id={ExportToDashboard.Create}
        text="Create New"
        testID="task--radio-button"
        onClick={() => handleSetActiveTab(ExportToDashboard.Create)}
        active={activeTab === ExportToDashboard.Create}
      />
      <Tabs.Tab
        id={ExportToDashboard.Update}
        text="Update Existing"
        testID="variable-radio-button"
        onClick={() => handleSetActiveTab(ExportToDashboard.Update)}
        active={activeTab === ExportToDashboard.Update}
      />
    </Tabs>
  )
}

export default ExportDashboardOverlayTabs

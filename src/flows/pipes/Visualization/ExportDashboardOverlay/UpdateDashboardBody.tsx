import React, {ChangeEvent, FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  Columns,
  ComponentSize,
  ComponentStatus,
  EmptyState,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'
import DashboardDropdown from 'src/flows/pipes/Visualization/ExportDashboardOverlay/DashboardDropdown'
import CellsDropdown from 'src/flows/pipes/Visualization/ExportDashboardOverlay/CellsDropdown'
import WarningPanel from 'src/flows/pipes/Visualization/ExportDashboardOverlay/WarningPanel'
import {
  Context,
  CREATE_CELL,
} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'
import {hasNoDashboards as hasNoDashboardsSelector} from 'src/dashboards/selectors'

const UpdateDashboardBody: FC = () => {
  const {cellName, handleSetCellName, selectedCell} = useContext(Context)

  const hasNoDashboards = useSelector(hasNoDashboardsSelector)

  if (hasNoDashboards) {
    return (
      <EmptyState size={ComponentSize.Medium}>
        <EmptyState.Text>
          You haven’t created any Dashboards yet
        </EmptyState.Text>
      </EmptyState>
    )
  }
  return (
    <>
      <Grid.Column widthXS={Columns.Twelve}>
        <Form.Element label="Destination Dashboard">
          <DashboardDropdown />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Twelve}>
        <Form.Element label="Destination Cell">
          <CellsDropdown />
        </Form.Element>
      </Grid.Column>
      {selectedCell && selectedCell.id === CREATE_CELL && (
        <Grid.Column widthXS={Columns.Twelve}>
          <Form.Element label="New Cell Name">
            <Input
              name="cell"
              placeholder="Name your cell"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleSetCellName(event.target.value)
              }
              value={cellName}
              testID="dashboard-form-cellname"
              status={ComponentStatus.Default}
            />
          </Form.Element>
        </Grid.Column>
      )}
      {selectedCell && selectedCell.id !== CREATE_CELL && (
        <Grid.Column widthXS={Columns.Twelve}>
          <WarningPanel />
        </Grid.Column>
      )}
    </>
  )
}

export default UpdateDashboardBody

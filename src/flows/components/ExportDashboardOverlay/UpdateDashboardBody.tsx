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
import DashboardDropdown from 'src/flows/components/ExportDashboardOverlay/DashboardDropdown'
import CellsDropdown from 'src/flows/components/ExportDashboardOverlay/CellsDropdown'
import WarningPanel from 'src/flows/components/ExportDashboardOverlay/WarningPanel'
import QueryTextPreview from 'src/flows/components/QueryTextPreview'
import {
  DashboardOverlayContext,
  CREATE_CELL,
} from 'src/flows/context/dashboardOverlay'
import {hasNoDashboards as hasNoDashboardsSelector} from 'src/dashboards/selectors'

const UpdateDashboardBody: FC = () => {
  const {hasError, cellName, handleSetCellName, selectedCell} = useContext(
    DashboardOverlayContext
  )

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
        <Form.Element
          label="Destination Dashboard"
          errorMessage={hasError && 'This field cannot be empty'}
        >
          <DashboardDropdown />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Twelve}>
        <Form.Element
          label="Destination Cell"
          errorMessage={hasError && 'This field cannot be empty'}
        >
          <CellsDropdown />
        </Form.Element>
      </Grid.Column>
      {selectedCell && selectedCell.id === CREATE_CELL && (
        <Grid.Column widthXS={Columns.Twelve}>
          <Form.Element
            label="New Cell Name"
            errorMessage={hasError && 'This field cannot be empty'}
          >
            <Input
              name="cell"
              placeholder="Name your cell"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleSetCellName(event.target.value)
              }
              value={cellName}
              testID="dashboard-form-cellname"
              status={
                hasError ? ComponentStatus.Error : ComponentStatus.Default
              }
            />
          </Form.Element>
        </Grid.Column>
      )}
      {selectedCell && selectedCell.id !== CREATE_CELL && (
        <Grid.Column>
          <WarningPanel />
        </Grid.Column>
      )}
      <Grid.Column>
        <QueryTextPreview />
      </Grid.Column>
    </>
  )
}

export default UpdateDashboardBody

import React, {ChangeEvent, FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  Alert,
  Columns,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  EmptyState,
  Form,
  Grid,
  IconFont,
  Input,
} from '@influxdata/clockface'
import DashboardDropdown from 'src/flows/pipes/Visualization/ExportDashboardOverlay/DashboardDropdown'
import CellsDropdown from 'src/flows/pipes/Visualization/ExportDashboardOverlay/CellsDropdown'
import {
  Context,
  CREATE_CELL,
} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'
import {hasNoDashboards as hasNoDashboardsSelector} from 'src/dashboards/selectors'

const UpdateDashboardBody: FC = () => {
  const {
    cellName,
    cellNameError,
    handleSetCellName,
    selectedCell,
    selectedCellError,
    selectedDashboardError,
  } = useContext(Context)

  const hasNoDashboards = useSelector(hasNoDashboardsSelector)

  const warning =
    'Note: changes made to existing dashboard cells cannot be undone'

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
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element
          label="Destination Dashboard"
          required={true}
          errorMessage={selectedDashboardError}
        >
          <DashboardDropdown />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element
          label="Destination Cell"
          required={true}
          errorMessage={selectedCellError}
        >
          <CellsDropdown />
        </Form.Element>
      </Grid.Column>
      {selectedCell && selectedCell.id === CREATE_CELL && (
        <Grid.Column widthXS={Columns.Twelve}>
          <Form.Element
            label="New Cell Name"
            required={true}
            errorMessage={cellNameError}
          >
            <Input
              name="cell"
              placeholder="Name your cell"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleSetCellName(event.target.value)
              }
              value={cellName}
              size={ComponentSize.Medium}
              testID="dashboard-form-cellname"
              status={ComponentStatus.Default}
            />
          </Form.Element>
        </Grid.Column>
      )}
      {selectedCell && selectedCell.id !== CREATE_CELL && (
        <Grid.Column widthXS={Columns.Twelve}>
          <Alert
            className="flow-visualization--export-warning"
            icon={IconFont.AlertTriangle}
            color={ComponentColor.Warning}
          >
            {warning}
          </Alert>
        </Grid.Column>
      )}
    </>
  )
}

export default UpdateDashboardBody

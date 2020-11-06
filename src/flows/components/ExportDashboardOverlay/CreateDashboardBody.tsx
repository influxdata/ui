import React, {ChangeEvent, FC, useContext} from 'react'
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'
import {DashboardOverlayContext} from 'src/flows/context/dashboardOverlay'

const CreateTaskBody: FC = () => {
  const {
    cellName,
    handleSetCellName,
    handleSetDashboardName,
    hasError,
    dashboardName,
  } = useContext(DashboardOverlayContext)

  return (
    <>
      <Grid.Column widthXS={Columns.Twelve}>
        <Form.Element
          label="New Dashboard Name"
          errorMessage={hasError && 'This field cannot be empty'}
        >
          <Input
            name="dashboard"
            placeholder="Name your dashboard"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSetDashboardName(event.target.value)
            }
            value={dashboardName}
            testID="dashboard-form-name"
            status={hasError ? ComponentStatus.Error : ComponentStatus.Default}
          />
        </Form.Element>
      </Grid.Column>
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
            status={hasError ? ComponentStatus.Error : ComponentStatus.Default}
          />
        </Form.Element>
      </Grid.Column>
    </>
  )
}

export default CreateTaskBody

import React, {ChangeEvent, FC, useContext} from 'react'
import {
  Columns,
  ComponentStatus,
  ComponentSize,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'
import {Context} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'

const CreateTaskBody: FC = () => {
  const {
    cellName,
    cellNameError,
    handleSetCellName,
    handleSetDashboardName,
    dashboardName,
    dashboardNameError,
  } = useContext(Context)

  return (
    <>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element
          label="New Dashboard Name"
          required={true}
          errorMessage={dashboardNameError}
        >
          <Input
            size={ComponentSize.Medium}
            name="dashboard"
            placeholder="Name your dashboard"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSetDashboardName(event.target.value)
            }
            value={dashboardName}
            testID="dashboard-form-name"
            status={
              dashboardNameError
                ? ComponentStatus.Error
                : ComponentStatus.Default
            }
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element
          label="New Cell Name"
          required={true}
          errorMessage={cellNameError}
        >
          <Input
            size={ComponentSize.Medium}
            name="cell"
            placeholder="Name your cell"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSetCellName(event.target.value)
            }
            value={cellName}
            testID="dashboard-form-cellname"
            status={
              cellNameError ? ComponentStatus.Error : ComponentStatus.Default
            }
          />
        </Form.Element>
      </Grid.Column>
    </>
  )
}

export default CreateTaskBody

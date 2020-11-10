import React, {ChangeEvent, FC, useContext} from 'react'
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'
import {Context} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'

const CreateTaskBody: FC = () => {
  const {
    cellName,
    handleSetCellName,
    handleSetDashboardName,
    dashboardName,
  } = useContext(Context)

  return (
    <>
      <Grid.Column widthXS={Columns.Twelve}>
        <Form.Element label="New Dashboard Name">
          <Input
            name="dashboard"
            placeholder="Name your dashboard"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleSetDashboardName(event.target.value)
            }
            value={dashboardName}
            testID="dashboard-form-name"
            status={ComponentStatus.Default}
          />
        </Form.Element>
      </Grid.Column>
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
    </>
  )
}

export default CreateTaskBody

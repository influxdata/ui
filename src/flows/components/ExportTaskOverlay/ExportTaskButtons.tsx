import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Form,
} from '@influxdata/clockface'
import {OverlayContext} from 'src/flows/context/overlay'

type Props = {
  onSubmit: () => void
}

const ExportTaskButtons: FC<Props> = ({onSubmit}) => {
  const history = useHistory()
  const {canSubmit} = useContext(OverlayContext)

  return (
    <Form.Footer>
      <Button
        text="Cancel"
        onClick={() => history.goBack()}
        titleText="Cancel"
        type={ButtonType.Button}
      />
      <Button
        text="Export Task"
        color={ComponentColor.Success}
        type={ButtonType.Submit}
        onClick={onSubmit}
        status={
          canSubmit() ? ComponentStatus.Default : ComponentStatus.Disabled
        }
        testID="task-form-export"
      />
    </Form.Footer>
  )
}

export default ExportTaskButtons

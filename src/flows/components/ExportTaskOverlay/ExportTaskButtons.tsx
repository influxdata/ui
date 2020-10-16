import React, {FC} from 'react'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Form,
} from '@influxdata/clockface'

type Props = {
  canSubmit: () => boolean
  onDismiss: () => void
  onSubmit: () => void
}

const ExportTaskButtons: FC<Props> = ({canSubmit, onDismiss, onSubmit}) => (
  <Form.Footer>
    <Button
      text="Cancel"
      onClick={onDismiss}
      titleText="Cancel"
      type={ButtonType.Button}
    />
    <Button
      text="Export Task"
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onSubmit}
      status={canSubmit() ? ComponentStatus.Default : ComponentStatus.Disabled}
      testID="task-form-export"
    />
  </Form.Footer>
)

export default ExportTaskButtons

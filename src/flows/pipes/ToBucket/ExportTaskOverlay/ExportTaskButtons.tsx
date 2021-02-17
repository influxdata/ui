// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Button, ButtonType, ComponentColor, Form} from '@influxdata/clockface'

// Contexts
import {Context} from 'src/flows/pipes/ToBucket/ExportTaskOverlay/context'
import {PopupContext} from 'src/flows/context/popup'

const ExportTaskButtons: FC = () => {
  const {submit} = useContext(Context)
  const {closeFn} = useContext(PopupContext)

  return (
    <Form.Footer>
      <Button
        text="Cancel"
        onClick={closeFn}
        titleText="Cancel"
        type={ButtonType.Button}
      />
      <Button
        text="Export Task"
        color={ComponentColor.Success}
        type={ButtonType.Submit}
        onClick={submit}
        testID="task-form-export"
      />
    </Form.Footer>
  )
}

export default ExportTaskButtons

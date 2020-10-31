// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {ComponentStatus, Form, Input, InputRef} from '@influxdata/clockface'

interface Props {
  value: string
  status: ComponentStatus
  error: string
  onChange: (e: ChangeEvent<InputRef>) => void
}

const AnnotationTimeStopInput: FC<Props> = ({
  value,
  status,
  error,
  onChange,
}) => {
  return (
    <Form.Element label="Stop Time" required={true} errorMessage={error}>
      <Input
        name="timeStop"
        value={value}
        onChange={onChange}
        status={status}
      />
    </Form.Element>
  )
}

export default AnnotationTimeStopInput

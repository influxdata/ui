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

const AnnotationSummaryInput: FC<Props> = ({
  value,
  status,
  error,
  onChange,
}) => {
  return (
    <Form.Element label="Summary" required={true} errorMessage={error}>
      <Input
        placeholder="ex: Deployed update"
        value={value}
        onChange={onChange}
        status={status}
      />
    </Form.Element>
  )
}

export default AnnotationSummaryInput

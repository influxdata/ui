// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {ComponentStatus, Form, Input, InputRef} from '@influxdata/clockface'

interface Props {
  value: string
  status: ComponentStatus
  error: string
  type: string
  onChange: (e: ChangeEvent<InputRef>) => void
}

const AnnotationTimeStartInput: FC<Props> = ({
  value,
  status,
  error,
  type,
  onChange,
}) => {
  const label = type === 'range' ? 'Start' : 'Timestamp'
  return (
    <Form.Element label={label} required={true} errorMessage={error}>
      <Input value={value} onChange={onChange} status={status} />
    </Form.Element>
  )
}

export default AnnotationTimeStartInput

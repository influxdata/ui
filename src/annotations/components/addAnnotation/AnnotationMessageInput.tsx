// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {
  ComponentStatus,
  Form,
  TextArea,
  TextAreaRef,
} from '@influxdata/clockface'

interface Props {
  value: string
  status: ComponentStatus
  error: string
  onChange: (e: ChangeEvent<TextAreaRef>) => void
}

const AnnotationMessageInput: FC<Props> = ({
  value,
  status,
  error,
  onChange,
}) => {
  return (
    <Form.Element label="Message" required={false} errorMessage={error}>
      <TextArea
        value={value}
        status={status}
        onChange={onChange}
        style={{height: '80px', minHeight: '80px'}}
      />
    </Form.Element>
  )
}

export default AnnotationMessageInput

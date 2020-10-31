// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {Form, TextArea, TextAreaRef} from '@influxdata/clockface'

interface Props {
  value: string
  onChange: (e: ChangeEvent<TextAreaRef>) => void
}

const AnnotationMessageInput: FC<Props> = ({value, onChange}) => {
  return (
    <Form.Element label="Message" required={false}>
      <TextArea
        name="message"
        value={value}
        onChange={onChange}
        style={{height: '80px', minHeight: '80px'}}
      />
    </Form.Element>
  )
}

export default AnnotationMessageInput

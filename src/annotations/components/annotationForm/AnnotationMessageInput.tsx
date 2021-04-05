// Libraries
import React, {FC, ChangeEvent, useEffect, useRef} from 'react'

// Components
import {Columns, Form, Grid, TextArea} from '@influxdata/clockface'

interface Props {
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  message: string
}

export const AnnotationMessageInput: FC<Props> = (props: Props) => {
  const textArea = useRef(null)
  const validationMessage = props.message ? '' : 'This field is required'

  useEffect(() => {
    textArea.current.focus()
  }, [])

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element
        label="Message (max: 255 characters)"
        required={true}
        errorMessage={validationMessage}
      >
        <TextArea
          name="message"
          value={props.message}
          onChange={props.onChange}
          style={{height: '80px', minHeight: '80px'}}
          ref={textArea}
          maxLength={255}
        />
      </Form.Element>
    </Grid.Column>
  )
}

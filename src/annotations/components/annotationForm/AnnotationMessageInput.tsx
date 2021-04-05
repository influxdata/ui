// Libraries
import React, {FC, ChangeEvent, useEffect, useRef} from 'react'

// Components
import {Columns, Form, Grid, TextArea} from '@influxdata/clockface'

// constants
import {MAX_ANNOTATIONS_MESSAGE_LENGTH} from 'src/shared/constants'

interface Props {
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  message: string
}

export const AnnotationMessageInput: FC<Props> = (props: Props) => {
  const textArea = useRef(null)
  let validationMessage = props.message ? '' : 'This field is required'

  if (props.message.length > MAX_ANNOTATIONS_MESSAGE_LENGTH) {
    validationMessage = `Max limit is ${MAX_ANNOTATIONS_MESSAGE_LENGTH} characters. (${props.message.length} / ${MAX_ANNOTATIONS_MESSAGE_LENGTH})`
  }

  useEffect(() => {
    textArea.current.focus()
  }, [])

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element
        label="Message"
        required={true}
        errorMessage={validationMessage}
      >
        <TextArea
          name="message"
          value={props.message}
          onChange={props.onChange}
          style={{height: '80px', minHeight: '80px'}}
          ref={textArea}
        />
      </Form.Element>
    </Grid.Column>
  )
}

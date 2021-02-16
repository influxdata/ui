// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {Columns, Form, Grid, TextArea} from '@influxdata/clockface'

interface Props {
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  message: string
}

export const AnnotationMessageInput: FC<Props> = (props: Props) => {
  const validationMessage = props.message ? '' : 'This field is required'

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
        />
      </Form.Element>
    </Grid.Column>
  )
}

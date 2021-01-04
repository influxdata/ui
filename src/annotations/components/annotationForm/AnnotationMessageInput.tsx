// Libraries
import React, {FC, ChangeEvent, useContext} from 'react'

// Components
import {Grid, Columns, Form, TextArea, TextAreaRef} from '@influxdata/clockface'

// Actions
import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

// Contexts
import {AnnotationFormContext} from 'src/annotations/components/annotationForm/AnnotationForm'

export const AnnotationMessageInput: FC = () => {
  const {message, dispatch} = useContext(AnnotationFormContext)

  const handleChange = (e: ChangeEvent<TextAreaRef>): void => {
    dispatch(updateAnnotationDraft({message: e.target.value}))
  }

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element label="Message" required={false}>
        <TextArea
          name="message"
          value={message}
          onChange={handleChange}
          style={{height: '80px', minHeight: '80px'}}
        />
      </Form.Element>
    </Grid.Column>
  )
}

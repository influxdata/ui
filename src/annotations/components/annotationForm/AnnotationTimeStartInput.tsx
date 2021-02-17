// Libraries
import React, {FC, ChangeEvent, useContext} from 'react'

// Components
import {Grid, Form, Input, InputRef, Columns} from '@influxdata/clockface'

// Actions
import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

// Contexts
import {AnnotationFormContext} from 'src/annotations/components/annotationForm/AnnotationForm'

export const AnnotationTimeStartInput: FC = () => {
  const {
    timeStart,
    timeStartStatus,
    timeStartError,
    type,
    dispatch,
  } = useContext(AnnotationFormContext)

  const label = type === 'range' ? 'Start Time' : 'Timestamp'

  const handleChange = (e: ChangeEvent<InputRef>): void => {
    dispatch(updateAnnotationDraft({timeStart: e.target.value}))
  }

  return (
    <Grid.Column widthXS={type === 'range' ? Columns.Six : Columns.Twelve}>
      <Form.Element label={label} required={true} errorMessage={timeStartError}>
        <Input
          name="timeStart"
          value={timeStart}
          onChange={handleChange}
          status={timeStartStatus}
        />
      </Form.Element>
    </Grid.Column>
  )
}

export default AnnotationTimeStartInput

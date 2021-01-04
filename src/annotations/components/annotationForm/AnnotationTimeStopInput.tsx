// Libraries
import React, {FC, ChangeEvent, useContext} from 'react'

// Components
import {Grid, Form, Input, InputRef, Columns} from '@influxdata/clockface'

// Actions
import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

// Contexts
import {AnnotationFormContext} from 'src/annotations/components/annotationForm/AnnotationForm'

export const AnnotationTimeStopInput: FC = () => {
  const {timeStop, timeStopStatus, timeStopError, type, dispatch} = useContext(
    AnnotationFormContext
  )

  const handleChange = (e: ChangeEvent<InputRef>): void => {
    dispatch(updateAnnotationDraft({timeStop: e.target.value}))
  }

  if (type === 'point') {
    return null
  }

  return (
    <Grid.Column widthXS={Columns.Six}>
      <Form.Element
        label="Stop Time"
        required={true}
        errorMessage={timeStopError}
      >
        <Input
          name="timeStop"
          value={timeStop}
          onChange={handleChange}
          status={timeStopStatus}
        />
      </Form.Element>
    </Grid.Column>
  )
}

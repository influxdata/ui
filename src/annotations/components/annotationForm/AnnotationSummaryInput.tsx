// Libraries
import React, {FC, ChangeEvent, useContext} from 'react'

// Components
import {Grid, Columns, Form, Input, InputRef} from '@influxdata/clockface'

// Actions
import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

// Contexts
import {AnnotationFormContext} from 'src/annotations/components/annotationForm/AnnotationForm'

export const AnnotationSummaryInput: FC = () => {
  const {summary, summaryStatus, summaryError, dispatch} = useContext(
    AnnotationFormContext
  )

  const handleChange = (e: ChangeEvent<InputRef>): void => {
    dispatch(updateAnnotationDraft({summary: e.target.value}))
  }

  return (
    <Grid.Column widthXS={Columns.Seven}>
      <Form.Element label="Summary" required={true} errorMessage={summaryError}>
        <Input
          name="summary"
          placeholder="ex: Deployed update"
          value={summary}
          onChange={handleChange}
          status={summaryStatus}
        />
      </Form.Element>
    </Grid.Column>
  )
}

export default AnnotationSummaryInput

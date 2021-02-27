// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'

interface Props {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  summary: string
}

export const AnnotationSummaryInput: FC<Props> = (props: Props) => {
  const validationMessage = props.summary ? '' : 'This field is required'

  return (
    <Grid.Column widthXS={Columns.Seven}>
      <Form.Element
        label="Summary"
        required={true}
        errorMessage={validationMessage}
      >
        <Input
          name="summary"
          placeholder="ex: Deployed update"
          value={props.summary}
          onChange={props.onChange}
          status={ComponentStatus.Default}
        />
      </Form.Element>
    </Grid.Column>
  )
}

export default AnnotationSummaryInput

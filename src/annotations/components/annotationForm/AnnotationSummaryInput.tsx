// Libraries
import React, {FC, ChangeEvent} from 'react'

// Components
import {ComponentStatus, Form, Input} from '@influxdata/clockface'

interface Props {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  summary: string
}

export const AnnotationSummaryInput: FC<Props> = (props: Props) => {
  const validationMessage = props.summary ? '' : 'This field is required'

  return (
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
  )
}

export default AnnotationSummaryInput

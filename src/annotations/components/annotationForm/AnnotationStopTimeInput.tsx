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
  stopTime: string
}

export const AnnotationStopTimeInput: FC<Props> = (props: Props) => {
  const validationMessage = props.stopTime ? '' : 'This field is required'

  return (
    <Grid.Column widthXS={Columns.Six}>
      <Form.Element
        label="Stop Time"
        required={true}
        errorMessage={validationMessage}
      >
        <Input
          name="stopTime"
          value={new Date(props.stopTime).toString()}
          onChange={props.onChange}
          status={ComponentStatus.Default}
        />
      </Form.Element>
    </Grid.Column>
  )
}

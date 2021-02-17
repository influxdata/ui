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
  startTime: string
}

export const AnnotationStartTimeInput: FC<Props> = (props: Props) => {
  const validationMessage = props.startTime ? '' : 'This field is required'

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element
        label="Start Time"
        required={true}
        errorMessage={validationMessage}
      >
        <Input
          name="startTime"
          value={new Date(props.startTime).toString()}
          onChange={props.onChange}
          status={ComponentStatus.Default}
        />
      </Form.Element>
    </Grid.Column>
  )
}

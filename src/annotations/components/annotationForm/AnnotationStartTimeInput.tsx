// Libraries
import React, {FC, ChangeEvent, KeyboardEvent} from 'react'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'

interface Props {
  onChange: (newTime: string) => void
  onSubmit: () => void
  startTime: string
}

export const AnnotationStartTimeInput: FC<Props> = (props: Props) => {
  const validationMessage = props.startTime ? '' : 'This field is required'

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value)
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      props.onSubmit()
      return
    }
  }

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
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          status={ComponentStatus.Default}
        />
      </Form.Element>
    </Grid.Column>
  )
}

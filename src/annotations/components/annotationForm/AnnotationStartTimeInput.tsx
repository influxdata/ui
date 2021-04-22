// Libraries
import React, {FC, ChangeEvent, KeyboardEvent, useState} from 'react'
import moment from 'moment'

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
  // initial input value is the startTime passed
  const [startTimeValue, setStartTimeValue] = useState<string>(
    moment(props.startTime).format('YYYY-MM-DD HH:mm:ss.SSS')
  )

  const isValidTimeFormat = (inputValue: string): boolean => {
    return moment(inputValue, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartTimeValue(event.target.value)

    if (isValidTimeFormat(event.target.value)) {
      props.onChange(
        moment(event.target.value)
          .toDate()
          .toISOString()
      )
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      props.onSubmit()
      return
    }
  }

  const isInputValueValid = (inputValue: string): boolean => {
    if (inputValue === null) {
      return true
    }

    return isValidTimeFormat(inputValue)
  }

  const getInputValidationMessage = (): string => {
    if (!isInputValueValid(startTimeValue)) {
      return 'Format must be YYYY-MM-DD [HH:mm:ss.SSS]'
    }

    return ''
  }

  const validationMessage = getInputValidationMessage()

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element
        label="Start Time"
        required={true}
        errorMessage={validationMessage}
      >
        <Input
          name="startTime"
          value={startTimeValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          status={ComponentStatus.Default}
        />
      </Form.Element>
    </Grid.Column>
  )
}

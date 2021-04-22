// Libraries
import React, {FC, ChangeEvent, KeyboardEvent, useState} from 'react'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'
import moment from 'moment'

interface Props {
  onChange: (newTime: string) => void
  onSubmit: () => void
  startTime: string
}

export const AnnotationStartTimeInput: FC<Props> = (props: Props) => {

  const [inputValue, setInputValue] = useState<string>(
    moment(props.startTime).format('YYYY-MM-DD HH:mm:ss.SSS')
  )

  const isValidTimeFormat = (d: string): boolean => {
    return moment(d, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)

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

  const getInputValue = (): string => {
    return inputValue
  }

  const isInputValueInvalid = (): boolean => {
    if (inputValue === null) {
      return false
    }

    return !isValidTimeFormat(inputValue)
  }

  const inputErrorMessage = (): string | undefined => {
    if (isInputValueInvalid()) {
      return 'Format must be YYYY-MM-DD [HH:mm:ss.SSS]'
    }

    return '\u00a0\u00a0'
  }

  const validationMessage = inputErrorMessage()
  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element
        label="Start Time"
        required={true}
        errorMessage={validationMessage}
      >
        <Input
          name="startTime"
          value={getInputValue()}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          status={ComponentStatus.Default}
        />
      </Form.Element>
    </Grid.Column>
  )
}

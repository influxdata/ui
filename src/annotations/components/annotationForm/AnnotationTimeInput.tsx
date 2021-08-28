// Libraries
import React, {
  CSSProperties,
  FC,
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useState,
} from 'react'
import {DateTime} from 'luxon'

// Components
import {ComponentStatus, Form, Input} from '@influxdata/clockface'

// Context
import {AppSettingContext} from 'src/shared/contexts/app'

// Utils
import {getLuxonFormatString, isValid} from 'src/utils/datetime/validator'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

interface Props {
  onChange: (newTime: string) => void
  onSubmit: () => void
  time: string | number
  timeFormat: string
  name: string
  titleText?: string
  style?: CSSProperties
  invalidMessage?: string
  onValidityCheck: (isValid: boolean) => void
}

/** all of these annotation time input fields are required fields */
export const REQUIRED_ERROR = 'Required'

export const AnnotationTimeInput: FC<Props> = (props: Props) => {
  const {timeZone} = useContext(AppSettingContext)

  const dateWithTimezone = new Date(props.time)
  const timeFormat = props.timeFormat

  if (timeZone === 'UTC') {
    dateWithTimezone.getTime()
  }

  const formatter = createDateTimeFormatter(timeFormat, timeZone)
  const [timeValue, setTimeValue] = useState<string>(
    formatter.format(dateWithTimezone)
  )

  const isValidTimeFormat = (inputValue: string): boolean => {
    const isValidFormat = isValid(inputValue, timeFormat)
    props.onValidityCheck(isValidFormat)
    return isValidFormat
  }

  const getInputValidationMessage = (): string => {
    // if the parent is giving us a message to display; do it.
    // else make our own.

    if (props.invalidMessage) {
      return props.invalidMessage
    }
    if (!timeValue) {
      return REQUIRED_ERROR
    }

    if (!isValidTimeFormat(timeValue)) {
      return `Format must be ${timeFormat}`
    }

    // it is valid
    return ''
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeValue(event.target.value)

    if (isValidTimeFormat(event.target.value)) {
      if (timeZone === 'UTC') {
        props.onChange(
          DateTime.fromFormat(
            event.target.value,
            getLuxonFormatString(timeFormat),
            {zone: 'UTC'}
          ).toISO()
        )
        return
      }

      props.onChange(
        DateTime.fromFormat(
          event.target.value,
          getLuxonFormatString(timeFormat)
        ).toISO()
      )
    }
  }

  // the AnnotationForm's submit method checks if the form is valid;
  // so this is not a bug (no accidental submits with invalid fields)
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      props.onSubmit()
      return
    }
  }

  const validationMessage = getInputValidationMessage()
  const testID = `${props.name}-testID`
  const labelText = props.titleText ?? 'Start Time'

  return (
    <Form.Element
      label={labelText}
      required={true}
      errorMessage={validationMessage}
      style={props.style}
    >
      <Input
        name={name}
        value={timeValue}
        testID={testID}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        status={ComponentStatus.Default}
      />
    </Form.Element>
  )
}

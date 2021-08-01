// Libraries
import React, {
  CSSProperties,
  FC,
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useState,
} from 'react'
import moment from 'moment'

// Components
import {ComponentStatus, Form, Input} from '@influxdata/clockface'

// Context
import {AppSettingContext} from 'src/shared/contexts/app'
import {setTimeToUTC} from 'src/dashboards/selectors'

// Utils
import {convertAnnotationTime12to24} from 'src/shared/utils/dateTimeUtils'

interface Props {
  onChange: (newTime: string) => void
  onSubmit: () => void
  time: string | number
  name: string
  titleText?: string
  style?: CSSProperties
  invalidMessage?: string
  onValidityCheck: (isValid: boolean) => void
}

const ANNOTATION_TIME_FORMAT_UTC = 'YYYY-MM-DD HH:mm:ss' // 24 hour
const ANNOTATION_TIME_FORMAT_LOCAL = 'YYYY-MM-DD h:mm:ss A' // 12 hour

/** all of these annotation time input fields are required fields */
export const REQUIRED_ERROR = 'Required'

export const AnnotationTimeInput: FC<Props> = (props: Props) => {
  const {timeZone} = useContext(AppSettingContext)

  const momentDateWithTimezone = moment(props.time)
  let timeFormat = ANNOTATION_TIME_FORMAT_LOCAL

  if (timeZone === 'UTC') {
    momentDateWithTimezone.utc()
    timeFormat = ANNOTATION_TIME_FORMAT_UTC
  }

  const [timeValue, setTimeValue] = useState<string>(
    momentDateWithTimezone.format(timeFormat)
  )

  const isValidTimeFormat = (inputValue: string): boolean => {
    let isValid = moment(inputValue, timeFormat, true).isValid()

    // momentjs says this format is valid: '2021-07-19 12:01:20 P' whereas the Date library needs the extra M like this: '2021-07-19 12:01:20 PM'
    // and that throws off the validation logic. temporary solution is to check whether meridian are the correct format
    if (timeFormat === ANNOTATION_TIME_FORMAT_LOCAL && isValid) {
      if (
        !(
          inputValue.split(' ')[2].toUpperCase() === 'AM' ||
          inputValue.split(' ')[2].toUpperCase() === 'PM'
        )
      ) {
        isValid = false
      }
    }
    props.onValidityCheck(isValid)
    return isValid
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
        props.onChange(setTimeToUTC(event.target.value))
        return
      }

      // we need to convert the timeformat from 12 to 24 because Firefox's Date implementation does not parse 12 hr formats
      props.onChange(
        new Date(convertAnnotationTime12to24(event.target.value)).toISOString()
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

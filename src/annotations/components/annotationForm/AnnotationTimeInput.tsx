// Libraries
import React, {
  FC,
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useState,
} from 'react'
import moment from 'moment'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'

// Context
import {AppSettingContext} from 'src/shared/contexts/app'

interface Props {
  onChange: (newTime: string) => void
  onSubmit: () => void
  time: string | number
  name: string
  titleText?: string
}

const ANNOTATION_TIME_FORMAT_UTC = 'YYYY-MM-DD HH:mm:ss' // 24 hour
const ANNOTATION_TIME_FORMAT_LOCAL = 'YYYY-MM-DD h:mm:ss A' // 12 hour

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
    return moment(inputValue, timeFormat, true).isValid()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeValue(event.target.value)

    if (isValidTimeFormat(event.target.value)) {
      if (timeZone === 'UTC') {
        props.onChange(
          moment
            .utc(event.target.value, timeFormat)
            .toDate()
            .toISOString()
        )
        return
      }

      props.onChange(
        moment(event.target.value, timeFormat)
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

  const isValidInputValue = (inputValue: string): boolean => {
    if (inputValue === null) {
      return true
    }

    return isValidTimeFormat(inputValue)
  }

  const getInputValidationMessage = (): string => {
    if (!isValidInputValue(timeValue)) {
      return `Format must be ${timeFormat}`
    }

    return ''
  }

  const validationMessage = getInputValidationMessage()

  const labelText = props.titleText ?? 'Start Time'
  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element
        label={labelText}
        required={true}
        errorMessage={validationMessage}
      >
        <Input
          name={name}
          value={timeValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          status={ComponentStatus.Default}
        />
      </Form.Element>
    </Grid.Column>
  )
}

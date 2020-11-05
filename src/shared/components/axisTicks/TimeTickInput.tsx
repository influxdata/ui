// Libraries
import React, {ChangeEvent, createRef, FC, RefObject, useState} from 'react'

// Components
import DatePicker from 'src/shared/components/dateRangePicker/DatePicker'
import {
  Appearance,
  Button,
  ButtonRef,
  Columns,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
  Grid,
  Input,
  Popover,
  PopoverInteraction,
  PopoverPosition,
} from '@influxdata/clockface'

interface TimeTickInputProps {
  axisName: string
  tickOptions: string[]
  initialTickOptionValue: number | string
  label: string
  placeholder?: string
  setOptions: (optionName: string, arg: string[] | number) => void
}

export const TimeTickInput: FC<TimeTickInputProps> = props => {
  const {
    axisName,
    tickOptions,
    initialTickOptionValue,
    label,
    placeholder = 'RFC3339 timestamp',
    setOptions,
  } = props

  const [tickOptionInput, setTickOptionInput] = useState(
    initialTickOptionValue === initialTickOptionValue
      ? initialTickOptionValue
      : ''
  )

  const [tickOptionInputStatus, setTickOptionInputStatus] = useState<
    ComponentStatus
  >(ComponentStatus.Default)

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)

  const triggerRef: RefObject<ButtonRef> = createRef()

  const changeTickOption = (value: string) => {
    setTickOptionInput(value)
    setTickOptionInputStatus(ComponentStatus.Default)
    const date = new Date(value)
    const convertedValue = date.valueOf()
    const tickOptionNameWithoutAxis = label.split(' ').join('')
    const tickOptionNameWithAxis = `${axisName.toLowerCase()}${tickOptionNameWithoutAxis}`
    const filteredTickOptions = Array.isArray(tickOptions)
      ? tickOptions.filter(option => option !== tickOptionNameWithAxis)
      : []
    setOptions(tickOptionNameWithoutAxis, convertedValue)
    if (convertedValue === convertedValue) {
      setOptions('GenerateAxisTicks', [
        ...filteredTickOptions,
        tickOptionNameWithAxis,
      ])
    } else {
      setOptions('GenerateAxisTicks', filteredTickOptions)
      if (value !== '') {
        setTickOptionInputStatus(ComponentStatus.Error)
      }
    }
  }

  const handleUseDatePicker = () => {
    setIsDatePickerOpen(true)
  }

  const handleSelectDate = (date: string) => {
    changeTickOption(date)
    setIsDatePickerOpen(false)
  }

  const handleChangeTickOption = (event: ChangeEvent<HTMLInputElement>) => {
    changeTickOption(event.target.value)
  }

  return (
    <>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element label={label}>
          <Input
            placeholder={placeholder}
            onChange={handleChangeTickOption}
            onFocus={handleChangeTickOption}
            value={tickOptionInput}
            status={tickOptionInputStatus}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element label="Tick Start">
          <Popover
            appearance={Appearance.Outline}
            position={PopoverPosition.ToTheLeft}
            triggerRef={triggerRef}
            visible={isDatePickerOpen}
            showEvent={PopoverInteraction.None}
            hideEvent={PopoverInteraction.None}
            distanceFromTrigger={8}
            testID="timerange-popover"
            enableDefaultStyles={false}
            contents={() => (
              <div
                className="range-picker--date-pickers"
                style={{position: 'relative'}}
              >
                <DatePicker
                  dateTime={new Date().toISOString()}
                  onSelectDate={handleSelectDate}
                  label="Tick Start"
                />
              </div>
            )}
          />
          <Button
            ref={triggerRef}
            color={ComponentColor.Primary}
            onClick={handleUseDatePicker}
            size={ComponentSize.Small}
            text="Use Date Picker"
          />
        </Form.Element>
      </Grid.Column>
    </>
  )
}

// Libraries
import React, {
  ChangeEvent,
  createRef,
  CSSProperties,
  FC,
  RefObject,
  useState,
} from 'react'

// Utils
import {useOneWayState} from 'src/shared/utils/useOneWayState'
import {convertUserInputValueToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Components
import DatePicker from 'src/shared/components/dateRangePicker/DatePicker'
import {ClickOutside} from 'src/shared/components/ClickOutside'
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
  IconFont,
  Popover,
  PopoverInteraction,
  PopoverPosition,
} from '@influxdata/clockface'

interface TimeTickInputProps {
  axisName: string
  tickOptions: string[]
  initialTickOptionValue: number | string
  label: string
  dateFormatPlaceholder?: string
  update: (data: any) => void
}

export const TimeTickInput: FC<TimeTickInputProps> = props => {
  const {
    axisName,
    tickOptions,
    initialTickOptionValue,
    label,
    dateFormatPlaceholder = 'RFC3339',
    update,
  } = props

  const [tickOptionInput, setTickOptionInput] = useOneWayState(
    initialTickOptionValue === initialTickOptionValue
      ? initialTickOptionValue
      : ''
  )

  const [tickOptionInputStatus, setTickOptionInputStatus] = useState<
    ComponentStatus
  >(ComponentStatus.Default)

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)

  const [
    isOnClickOutsideHandlerActive,
    setIsOnClickOutsideHandlerActive,
  ] = useState<boolean>(true)

  const triggerRef: RefObject<ButtonRef> = createRef()

  const updateTickOption = (value?: string | number) => {
    const convertedValue = convertUserInputValueToNumOrNaN(
      value === undefined ? tickOptionInput : value
    )
    const tickOptionNameWithoutAxis = label.split(' ').join('')
    const tickOptionNameWithAxis = `${axisName.toLowerCase()}${tickOptionNameWithoutAxis}`
    const computedTickOptions = Array.isArray(tickOptions)
      ? tickOptions.filter(option => option !== tickOptionNameWithAxis)
      : []

    if (!Number.isNaN(convertedValue)) {
      computedTickOptions.push(tickOptionNameWithAxis)
    } else if (tickOptionInput !== '') {
      setTickOptionInputStatus(ComponentStatus.Error)
    }
    update({
      [tickOptionNameWithAxis]: convertedValue,
      [`generate${axisName.toUpperCase()}AxisTicks`]: computedTickOptions,
    })
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setTickOptionInput(event.target.value)
    setTickOptionInputStatus(ComponentStatus.Default)
  }

  const handleBlur = () => updateTickOption()

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateTickOption()
    }
  }

  const getDatePickerDateTime = () => {
    const date = new Date(tickOptionInput)
    if (!Number.isNaN(date.valueOf())) {
      return date.toISOString()
    }
    return new Date().toISOString()
  }

  const handleReset = () => {
    setTickOptionInput('')
    updateTickOption('')
  }

  const showDatePicker = () => setIsDatePickerOpen(true)
  const hideDatePicker = () => setIsDatePickerOpen(false)

  const toggleDatePicker = () => {
    if (isDatePickerOpen) {
      hideDatePicker()
    } else {
      showDatePicker()
    }
  }

  const handleSelectDate = (date: string) => {
    const dateRFC3339 = new Date(date).valueOf()
    setTickOptionInput(dateRFC3339 === dateRFC3339 ? String(dateRFC3339) : '')
    setTickOptionInputStatus(ComponentStatus.Default)
    updateTickOption(dateRFC3339)
  }

  const onClickOutside = () => {
    if (isOnClickOutsideHandlerActive) {
      hideDatePicker()
    }
  }

  const allowOnClickOutside = () => setIsOnClickOutsideHandlerActive(true)
  const suppressOnClickOutside = () => setIsOnClickOutsideHandlerActive(false)

  const styles: CSSProperties = isDatePickerOpen
    ? {position: 'relative'}
    : {
        top: `${window.innerHeight / 2}px`,
        left: `${window.innerWidth / 2}px`,
        transform: `translate(-50%, -50%)`,
      }

  return (
    <>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element label="Start Tick Marks At">
          <Input
            placeholder={dateFormatPlaceholder}
            onChange={handleInput}
            onFocus={handleInput}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            value={tickOptionInput}
            status={tickOptionInputStatus}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element label="Date Picker">
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
              <ClickOutside onClickOutside={onClickOutside}>
                <div
                  className="range-picker react-datepicker-ignore-onclickoutside"
                  style={{...styles}}
                >
                  <button
                    className="range-picker--dismiss"
                    onClick={hideDatePicker}
                  />
                  <div className="range-picker--date-pickers">
                    <DatePicker
                      dateTime={getDatePickerDateTime()}
                      onSelectDate={handleSelectDate}
                      label="Start Tick Marks At"
                    />
                  </div>
                  <Button
                    color={ComponentColor.Danger}
                    onClick={handleReset}
                    size={ComponentSize.Small}
                    text="Reset"
                  />
                </div>
              </ClickOutside>
            )}
          />
          {isDatePickerOpen ? (
            <Button
              ref={triggerRef}
              color={ComponentColor.Danger}
              onClick={hideDatePicker}
              onMouseEnter={suppressOnClickOutside}
              onMouseLeave={allowOnClickOutside}
              size={ComponentSize.Small}
              icon={IconFont.Calendar}
            />
          ) : (
            <Button
              ref={triggerRef}
              color={ComponentColor.Primary}
              onClick={toggleDatePicker}
              onMouseEnter={suppressOnClickOutside}
              onMouseLeave={allowOnClickOutside}
              size={ComponentSize.Small}
              icon={IconFont.Calendar}
            />
          )}
        </Form.Element>
      </Grid.Column>
    </>
  )
}

// Libraries
import React, {
  ChangeEvent,
  createRef,
  CSSProperties,
  FC,
  RefObject,
  useContext,
  useState,
} from 'react'

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

// Context
import {AppSettingContext} from 'src/shared/contexts/app'

// Utils
import {isValidRFC3339} from 'src/utils/datetime/validator'
import {convertDateToRFC3339} from 'src/utils/datetime/formatters'

import {TICK_PROPERTY_PREFIX} from 'src/visualization/constants'
interface TimeTickInputProps {
  axisName: string
  tickPropertyName: string
  tickOptions: string[]
  initialTickOptionValue: number | string
  dateFormatPlaceholder?: string
  update: (data: any) => void
}

const noOp = () => {}

const getInitialTimeTick = (
  initialTick: string | number,
  timeZone: string
): string => {
  if (typeof initialTick === 'number' && initialTick === initialTick) {
    const initialDate = new Date(initialTick)
    if (isValidRFC3339(initialDate.toISOString())) {
      return convertDateToRFC3339(initialDate, timeZone)
    }
  }
  return ''
}

export const TimeTickInput: FC<TimeTickInputProps> = props => {
  const {
    axisName,
    tickPropertyName,
    tickOptions,
    initialTickOptionValue,
    dateFormatPlaceholder = 'RFC 3339 or YYYY-MM-DDTHH:mm:ssZ',
    update,
  } = props

  const {timeZone} = useContext(AppSettingContext)

  const [tickOptionInput, setTickOptionInput] = useState<string>(
    getInitialTimeTick(initialTickOptionValue, timeZone)
  )

  const [tickOptionInputStatus, setTickOptionInputStatus] =
    useState<ComponentStatus>(ComponentStatus.Default)

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)

  const [isOnClickOutsideHandlerActive, setIsOnClickOutsideHandlerActive] =
    useState<boolean>(true)

  const triggerRef: RefObject<ButtonRef> = createRef()

  const updateTickOption = (value?: string) => {
    const dateString = value === undefined ? tickOptionInput : value
    const convertedValue = new Date(dateString).valueOf()
    const tickOptionNameWithoutAxis = `${TICK_PROPERTY_PREFIX}${tickPropertyName
      .slice(0, 1)
      .toUpperCase()}${tickPropertyName.slice(1).toLowerCase()}`
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
    if (isValidRFC3339(event.target.value)) {
      setTickOptionInputStatus(ComponentStatus.Default)
    } else {
      setTickOptionInputStatus(ComponentStatus.Error)
    }
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
    setTickOptionInputStatus(ComponentStatus.Default)
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
    if (isValidRFC3339(date)) {
      const dateRFC3339 = convertDateToRFC3339(new Date(date), timeZone)
      setTickOptionInput(dateRFC3339)
      setTickOptionInputStatus(ComponentStatus.Default)
      updateTickOption(dateRFC3339)
    } else {
      setTickOptionInput('')
      setTickOptionInputStatus(ComponentStatus.Error)
    }
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
      <Grid.Column widthXS={Columns.Twelve}>
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
      <Grid.Column widthXS={Columns.Twelve}>
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
                      onInvalidInput={noOp}
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

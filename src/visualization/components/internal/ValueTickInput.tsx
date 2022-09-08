// Libraries
import React, {ChangeEvent, FC, useState} from 'react'

// Utils
import {convertUserInputValueToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
} from '@influxdata/clockface'

import {
  TICK_PROPERTY_PREFIX,
  TICK_PROPERTY_SUFFIX,
} from 'src/visualization/constants'

interface ValueTickInputProps {
  axisName: string
  tickPropertyName: string
  tickOptions: string[]
  initialTickOptionValue: number | string
  label: string
  placeholder?: string
  update: (data: any) => void
  elementStylingClass?: string
}

export const ValueTickInput: FC<ValueTickInputProps> = props => {
  const {
    axisName,
    tickPropertyName,
    tickOptions,
    initialTickOptionValue,
    label,
    placeholder,
    update,
    elementStylingClass,
  } = props
  const [tickOptionInput, setTickOptionInput] = useState(
    initialTickOptionValue === initialTickOptionValue
      ? initialTickOptionValue
      : ''
  )
  const [tickOptionInputStatus, setTickOptionInputStatus] =
    useState<ComponentStatus>(ComponentStatus.Default)

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setTickOptionInput(event.target.value)
    setTickOptionInputStatus(ComponentStatus.Default)
  }

  const updateTickOption = () => {
    const convertedValue = convertUserInputValueToNumOrNaN(tickOptionInput)

    let tickOptionNameWithoutAxis = `${tickPropertyName
      .slice(0, 1)
      .toUpperCase()}${tickPropertyName.slice(1).toLowerCase()}`
    if (tickOptionNameWithoutAxis === 'Total') {
      tickOptionNameWithoutAxis += TICK_PROPERTY_SUFFIX
    } else {
      tickOptionNameWithoutAxis = `${TICK_PROPERTY_PREFIX}${tickOptionNameWithoutAxis}`
    }

    const tickOptionNameWithAxis = `${axisName.toLowerCase()}${tickOptionNameWithoutAxis}`
    const filteredTickOptions = Array.isArray(tickOptions)
      ? tickOptions.filter(option => option !== tickOptionNameWithAxis)
      : []

    if (convertedValue === convertedValue) {
      update({
        [tickOptionNameWithAxis]: convertedValue,
        [`generate${axisName.toUpperCase()}AxisTicks`]: [
          ...filteredTickOptions,
          tickOptionNameWithAxis,
        ],
      })
    } else {
      update({
        [tickOptionNameWithAxis]: convertedValue,
        [`generate${axisName.toUpperCase()}AxisTicks`]: filteredTickOptions,
      })
      if (tickOptionInput !== '') {
        setTickOptionInputStatus(ComponentStatus.Error)
      }
    }
  }

  const handleOnBlur = () => updateTickOption()

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      updateTickOption()
    }
  }

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element label={label} className={elementStylingClass}>
        <Input
          placeholder={placeholder}
          onChange={handleInput}
          onFocus={handleInput}
          onBlur={handleOnBlur}
          onKeyPress={handleKeyPress}
          value={tickOptionInput}
          status={tickOptionInputStatus}
        />
      </Form.Element>
    </Grid.Column>
  )
}

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

interface ValueTickInputProps {
  axisName: string
  tickPropertyName: string
  tickOptions: string[]
  initialTickOptionValue: number | string
  label: string
  placeholder?: string
  update: (data: any) => void
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
  } = props
  const [tickOptionInput, setTickOptionInput] = useState(
    initialTickOptionValue === initialTickOptionValue
      ? initialTickOptionValue
      : ''
  )
  const [tickOptionInputStatus, setTickOptionInputStatus] = useState<
    ComponentStatus
  >(ComponentStatus.Default)

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setTickOptionInput(event.target.value)
    setTickOptionInputStatus(ComponentStatus.Default)
  }

  const updateTickOption = () => {
    const convertedValue = convertUserInputValueToNumOrNaN(tickOptionInput)
    const tickOptionNameWithoutAxis = `${tickPropertyName
      .slice(0, 1)
      .toUpperCase()}${tickPropertyName.slice(1)}`
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
      <Form.Element label={label}>
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

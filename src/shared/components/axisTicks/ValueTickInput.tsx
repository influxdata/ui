// Libraries
import React, {ChangeEvent, FC, useState} from 'react'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

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
  tickOptions: string[]
  initialTickOptionValue: number | string
  label: string
  placeholder?: string
  setOptions: (optionName: string, arg: string[] | number) => void
}

export const ValueTickInput: FC<ValueTickInputProps> = props => {
  const {
    axisName,
    tickOptions,
    initialTickOptionValue,
    label,
    placeholder = 'Enter a number',
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

  const changeTickOption = (event: ChangeEvent<HTMLInputElement>) => {
    setTickOptionInput(event.target.value)
    setTickOptionInputStatus(ComponentStatus.Default)
    const convertedValue = convertUserInputToNumOrNaN(event)
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
      if (event.target.value !== '') {
        setTickOptionInputStatus(ComponentStatus.Error)
      }
    }
  }

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element label={label}>
        <Input
          placeholder={placeholder}
          onChange={changeTickOption}
          onFocus={changeTickOption}
          value={tickOptionInput}
          status={tickOptionInputStatus}
        />
      </Form.Element>
    </Grid.Column>
  )
}

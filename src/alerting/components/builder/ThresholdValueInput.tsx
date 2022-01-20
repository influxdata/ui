// Libraries
import React, {FC, useState} from 'react'

// Components
import {ComponentStatus, FlexBox, Input, InputType} from '@influxdata/clockface'
import {GreaterThreshold, LesserThreshold} from 'src/types'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Types
interface Props {
  threshold: GreaterThreshold | LesserThreshold
  changeValue: (value: number) => void
  level: string
}

const ThresholdValueStatement: FC<Props> = ({
  threshold,
  changeValue,
  level,
}) => {
  const [value, setValue] = useState(threshold.value.toString())

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    changeValue(convertUserInputToNumOrNaN(e))
  }
  const getInputStatus = (): ComponentStatus => {
    if (Number(value)) {
      return ComponentStatus.Default
    }

    return ComponentStatus.Error
  }
  return (
    <FlexBox.Child testID="component-spacer--flex-child">
      <Input
        onChange={onChangeValue}
        name=""
        type={InputType.Number}
        value={value}
        testID={`input-field-${level}`}
        status={getInputStatus()}
      />
    </FlexBox.Child>
  )
}

export default ThresholdValueStatement

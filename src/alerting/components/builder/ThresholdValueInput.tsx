// Libraries
import React, {FC} from 'react'

// Components
import {FlexBox, Input, InputType} from '@influxdata/clockface'
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
  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeValue(convertUserInputToNumOrNaN(e))
  }
  return (
    <FlexBox.Child testID="component-spacer--flex-child">
      <Input
        onChange={onChangeValue}
        name=""
        type={InputType.Number}
        value={threshold.value}
        testID={`input-field-${level}`}
      />
    </FlexBox.Child>
  )
}

export default ThresholdValueStatement

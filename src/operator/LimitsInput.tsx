import React, {FC} from 'react'
import {Input, InputType} from '@influxdata/clockface'
import {OrgLimits} from 'src/types/operator'

interface Props {
  type: InputType
  name: string
  limits: OrgLimits
  onChangeLimits: (limits: OrgLimits) => void
}

const LimitsInput: FC<Props> = ({type, name, limits, onChangeLimits}) => {
  const onChange = e => {
    const newValue =
      type === InputType.Number ? parseFloat(e.target.value) : e.target.value

    const newLimits = {...limits, [name]: newValue}
    onChangeLimits(newLimits)
  }
  return (
    <Input
      type={type}
      name={name}
      value={limits?.[name] ?? ''}
      onChange={onChange}
    />
  )
}

export default LimitsInput

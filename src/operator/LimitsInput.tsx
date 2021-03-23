import React, {FC} from 'react'
import {Input, InputType} from '@influxdata/clockface'
import {get} from 'lodash'
import {set} from 'lodash/fp'
// import {Limits} from 'js/types'

interface Props {
  type: InputType
  name: string
  limits: any
  onChangeLimits: (limits: any) => void
  // limits: Limits
  // onChangeLimits: (limits: Limits) => void
}

const LimitsInput: FC<Props> = ({type, name, limits, onChangeLimits}) => {
  const onChange = e => {
    const newValue =
      type === InputType.Number ? parseFloat(e.target.value) : e.target.value
    const newLimits = set(name, newValue, limits)
    onChangeLimits(newLimits)
  }
  return (
    <Input
      type={type}
      name={name}
      value={get(limits, name, '')}
      onChange={onChange}
    />
  )
}

export default LimitsInput

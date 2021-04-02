import React, {FC} from 'react'
import {Input, InputType} from '@influxdata/clockface'
import {get} from 'lodash'
import {set} from 'lodash/fp'
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

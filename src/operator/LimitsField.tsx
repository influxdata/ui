// Libraries
import React, {FC, useContext} from 'react'
import {Input, InputType} from '@influxdata/clockface'
import {get} from 'lodash'
import {set} from 'lodash/fp'

// Types
import {OrgLimits} from 'src/types'

// Contexts
import {OperatorContext} from 'src/operator/context/operator'

interface Props {
  type: InputType
  name: string
  limits: OrgLimits
  onChangeLimits: (limits: OrgLimits) => void
}

const LimitsField: FC<Props> = ({type, name, limits, onChangeLimits}) => {
  const {hasWritePermissions} = useContext(OperatorContext)
  const value = get(limits, name, '')

  if (!hasWritePermissions) {
    return (
      <p data-testid={`limits-${name}--p`} className="operator-limits-label">
        {value}
      </p>
    )
  }

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
      value={value}
      onChange={onChange}
      testID={`limits-${name}--input`}
    />
  )
}

export default LimitsField

// Libraries
import React, {FC, useContext, useState} from 'react'
import {Input, InputType} from '@influxdata/clockface'
import {get} from 'lodash'
import {set} from 'lodash/fp'

// Types
import {OrgLimits} from 'src/types'

// Contexts
import {OperatorContext} from 'src/operator/context/operator'
import {OverlayContext} from 'src/operator/context/overlay'

interface Props {
  type: InputType
  name: string
  limits: OrgLimits
  onChangeLimits: (limits: OrgLimits) => void
}

const LimitsField: FC<Props> = ({type, name, limits, onChangeLimits}) => {
  const [hasFocus, setHasFocus] = useState(false)
  const {hasWritePermissions} = useContext(OperatorContext)
  const {organization} = useContext(OverlayContext)
  const ioxCardinality =
    organization?.storageType === 'iox' && name === 'rate.cardinality'

  const getIOxCardinalityValue = () => {
    const ioxCardinalityLimit = 'N/A - IOx'

    // update the type to text so that the input field is not a number field
    type = InputType.Text

    return ioxCardinalityLimit
  }

  const value = ioxCardinality
    ? getIOxCardinalityValue()
    : get(limits, name, '')

  const formatted_value =
    type === InputType.Number
      ? Intl.NumberFormat(navigator.language).format(value)
      : value

  if (!hasWritePermissions) {
    return (
      <p data-testid={`limits-${name}--p`} className="operator-limits-label">
        {formatted_value}
      </p>
    )
  }

  const onChange = e => {
    const newValue =
      type === InputType.Number ? parseFloat(e.target.value) : e.target.value
    const newLimits = set(name, newValue, limits)
    onChangeLimits(newLimits)
  }

  if (type === InputType.Number) {
    return hasFocus ? (
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={() => setHasFocus(false)}
        testID={`limits-${name}--input`}
      />
    ) : (
      <Input
        type={InputType.Text}
        name={name}
        value={formatted_value}
        onChange={onChange}
        onFocus={() => setHasFocus(true)}
        testID={`limits-${name}--input`}
      />
    )
  }

  return (
    <Input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={() => setHasFocus(false)}
      testID={`limits-${name}--input`}
    />
  )
}

export default LimitsField

// Libraries
import React, {FC, useContext} from 'react'
import {InputType} from '@influxdata/clockface'

// Types
import {OrgLimits} from 'src/types'

// Components
import LimitsInput from 'src/operator/LimitsInput'
import LimitsLabel from 'src/operator/LimitsLabel'

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

  if (hasWritePermissions()) {
    return (
      <LimitsInput
        type={type}
        name={name}
        limits={limits}
        onChangeLimits={onChangeLimits}
      />
    )
  }

  return <LimitsLabel name={name} limits={limits} />
}

export default LimitsField

import React, {FC} from 'react'
import {InputType} from '@influxdata/clockface'
import {OrgLimits} from 'src/types'
import {useSelector} from 'react-redux'
import {getQuartzMe} from 'src/me/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import LimitsInput from './LimitsInput'
import LimitsLabel from './LimitsLabel'

interface Props {
  type: InputType
  name: string
  limits: OrgLimits
  onChangeLimits: (limits: OrgLimits) => void
}

const LimitsField: FC<Props> = ({type, name, limits, onChangeLimits}) => {
  const quartzMe = useSelector(getQuartzMe)

  const operatorHasPermissions = () => {
    return (
      !isFlagEnabled('operatorRole') ||
      (quartzMe.isOperator && quartzMe?.operatorRole === 'read-write')
    )
  }

  if (operatorHasPermissions()) {
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

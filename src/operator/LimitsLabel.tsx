import React, {FC} from 'react'
import {get} from 'lodash'
import {OrgLimits} from 'src/types'

interface Props {
  name: string
  limits: OrgLimits
}

const LimitsLabel: FC<Props> = ({name, limits}) => {
  return <p className="operator-limits-label">{get(limits, name, '')}</p>
}

export default LimitsLabel

import React, {FC} from 'react'
import {startCase, floor} from 'lodash'

import {ComponentSize, InfluxColors, Panel} from '@influxdata/clockface'
import {nsToDays, minToSeconds} from 'src/billing/utils/timeHelpers'
import {kbToMb} from 'src/billing/utils/unitHelpers'

interface Props {
  name: string
  value: string | number
}

const getName = (name: string): string => {
  switch (name) {
    case 'writeKBs':
      return 'Writes'
    case 'readKBs':
      return 'Reads'
    case 'cardinality':
      return 'Series Cardinality'
    default:
      return `Max ${startCase(name)}`
  }
}

const getStat = (name: string, value: any) => {
  switch (name) {
    case 'writeKBs':
    case 'readKBs':
      const sIn5Min = minToSeconds(5)
      const mbPerSecond = kbToMb(value.maxAllowed as number)
      const mb5Min = floor(mbPerSecond * sIn5Min)
      return `${mb5Min} MB / 5 min`
    case 'bucket':
      return `${nsToDays(value.maxRetentionSeconds as number)} days`
    default:
      return value.maxAllowed
  }
}

const OrgLimitStat: FC<Props> = ({name, value}) => {
  return (
    <Panel backgroundColor={InfluxColors.Onyx} className="org-limit">
      <Panel.Header size={ComponentSize.ExtraSmall}>
        <h5 data-testid="title-header--name">{getName(name)}</h5>
      </Panel.Header>
      <Panel.Body size={ComponentSize.ExtraSmall}>
        <div className="org-limit--stat" data-testid="title-header--value">
          {getStat(name, value)}
        </div>
      </Panel.Body>
    </Panel>
  )
}

export default OrgLimitStat

// Libraries
import React, {FC} from 'react'
import {startCase} from 'lodash'

// Componentd
import {ComponentSize, InfluxColors, Panel} from '@influxdata/clockface'
import {secondsToDays, minToSeconds} from 'src/billing/utils/timeHelpers'

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
    case 'rules':
      return 'Max Notifications'
    case 'maxRetentionSeconds':
      return `${startCase(name)}`
    default:
      return `Max ${startCase(name)}`
  }
}

const getStat = (name: string, value: any) => {
  switch (name) {
    case 'writeKBs':
    case 'readKBs':
      const sIn5Min = minToSeconds(5)
      const mbPerSecond = value / 1000
      const mb5Min = Math.floor(mbPerSecond * sIn5Min)
      return `${mb5Min} MB / 5 min`
    case 'maxRetentionSeconds':
      return `${secondsToDays(value)} days`
    default:
      return value
  }
}

const OrgLimitStat: FC<Props> = ({name, value}) => (
  <Panel backgroundColor={InfluxColors.Grey25} className="org-limit">
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

export default OrgLimitStat

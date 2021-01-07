import React, {FC} from 'react'
import {flatMap} from 'lodash'
import {Grid, Columns} from '@influxdata/clockface'
import OrgLimitStat from './OrgLimitStat'
import {Limits} from 'src/types'

interface Props {
  orgLimits: Limits
}
type KV = [string, string | number]

const excludeOrgID = (limitEntries: KV[]): KV[] => {
  return limitEntries.filter(
    ([limitName, _limitValue]) => limitName !== 'orgID'
  )
}

const rejectConcurrencyLimits = (limitEntries: KV[]): KV[] => {
  const excludedLimits = [
    'blockedNotificationRules',
    'blockedNotificationEndpoints',
  ]
  return limitEntries.filter(
    ([limitName, _limitValue]) => !excludedLimits.includes(limitName)
  )
}

const limits = (orgLimits: Limits): KV[] => {
  const limitsByCategory = excludeOrgID(Object.entries(orgLimits))

  return flatMap(limitsByCategory, ([_category, limits]) =>
    rejectConcurrencyLimits(Object.entries(limits))
  )
}

const OrgLimits: FC<Props> = ({orgLimits}) => {
  return (
    <Grid>
      {limits(orgLimits).map(([name, value]) => {
        return (
          <Grid.Column
            key={name}
            widthXS={Columns.Twelve}
            widthSM={Columns.Six}
            widthMD={Columns.Four}
            widthLG={Columns.Three}
          >
            <OrgLimitStat name={name} value={value} />
          </Grid.Column>
        )
      })}
    </Grid>
  )
}

export default OrgLimits

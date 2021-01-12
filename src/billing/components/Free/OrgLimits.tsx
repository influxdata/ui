import React, {FC} from 'react'
import {Grid, Columns} from '@influxdata/clockface'
import OrgLimitStat from 'src/billing/components/Free/OrgLimitStat'
import {Limits} from 'src/types'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

type KV = [string, string | number]

const excludeOrgID = (limitEntries: KV[]): KV[] => {
  return limitEntries.filter(
    ([limitName]) => limitName !== 'orgID' && limitName !== 'status'
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
  return limitsByCategory.flatMap(([_category, limits]) =>
    rejectConcurrencyLimits(Object.entries(limits))
  )
}

const OrgLimits: FC = () => {
  const [{orgLimits}] = useBilling()

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

import React, {FC} from 'react'
import {Grid, Columns} from '@influxdata/clockface'
import OrgLimitStat from 'src/billing/components/Free/OrgLimitStat'

// Utils
import {useBilling} from 'src/billing/components/BillingPage'

// Types
import {OrgLimits} from 'src/types/billing'

type KV = [string, string | number]

const excludeOrgIDAndStatus = (limitEntries: KV[]): KV[] => {
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

const limits = (orgLimits: OrgLimits): KV[] => {
  const limitsByCategory = excludeOrgIDAndStatus(Object.entries(orgLimits))

  return limitsByCategory.flatMap(([_category, limits]) =>
    rejectConcurrencyLimits(Object.entries(limits))
  )
}

const OrgLimits: FC = () => {
  const [{orgLimits}] = useBilling()

  return (
    <Grid>
      {limits(orgLimits).flatMap(([name, value]) => {
        if (name === 'rate') {
          return Object.entries(value).map(([n, v]) => {
            return (
              <Grid.Column
                key={n}
                widthXS={Columns.Twelve}
                widthSM={Columns.Six}
                widthMD={Columns.Four}
                widthLG={Columns.Three}
              >
                <OrgLimitStat name={n} value={v} />
              </Grid.Column>
            )
          })
        }
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

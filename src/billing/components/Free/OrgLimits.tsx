import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Grid, Columns} from '@influxdata/clockface'
import OrgLimitStat from 'src/billing/components/Free/OrgLimitStat'
import {AppState} from 'src/types'
import {LimitsState} from 'src/cloud/reducers/limits'

type KV = [string, string | number]

const excludeOrgIDAndStatus = (limitEntries: KV[]): KV[] => {
  return limitEntries.filter(
    ([limitName]) => limitName !== 'orgID' && limitName !== 'status'
  )
}

// TODO(ariel): get these rejections hooked up
// const rejectConcurrencyLimits = (limitEntries: KV[]): KV[] => {
//   const excludedLimits = [
//     'blockedNotificationRules',
//     'blockedNotificationEndpoints',
//   ]
//   console.log({limitEntries})
//   return limitEntries.filter(
//     ([limitName, _limitValue]) => !excludedLimits.includes(limitName)
//   )
// }

const limits = (orgLimits: LimitsState | {}): KV[] => {
  return excludeOrgIDAndStatus(Object.entries(orgLimits))
}

const OrgLimits: FC = () => {
  const orgLimits =
    useSelector((state: AppState): LimitsState => state?.cloud?.limits) ?? {}
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

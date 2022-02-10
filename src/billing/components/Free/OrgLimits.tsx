import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Grid, Columns} from '@influxdata/clockface'
import OrgLimitStat from 'src/billing/components/Free/OrgLimitStat'

// Types
import {AppState} from 'src/types'
import {Limit} from 'src/cloud/actions/limits'
import {LimitsState} from 'src/cloud/reducers/limits'

const limits = (orgLimits: LimitsState | {}) =>
  Object.entries(orgLimits).filter(
    ([limitName]) =>
      limitName !== 'orgID' &&
      limitName !== 'status' &&
      limitName !== 'endpoints'
  )

const OrgLimits: FC = () => {
  const orgLimits = useSelector((state: AppState) => state.cloud?.limits ?? {})

  return (
    <Grid>
      {limits(orgLimits).flatMap(([name, value]: [string, Limit]) => {
        if (name === 'buckets') {
          return Object.entries(value)
            .filter(([n]) => n !== 'limitStatus')
            .map(([n, v]: [string, number]) => {
              return (
                <Grid.Column
                  key={n}
                  widthXS={Columns.Twelve}
                  widthSM={Columns.Six}
                  widthMD={Columns.Four}
                  widthLG={Columns.Three}
                >
                  <OrgLimitStat
                    name={n === 'maxAllowed' ? name : n}
                    value={v}
                  />
                </Grid.Column>
              )
            })
        }
        if (name === 'rate') {
          return Object.entries(value)
            .filter(([n]) => n !== 'queryTime')
            .map(([n, v]: [string, Limit]) => {
              return (
                <Grid.Column
                  key={n}
                  widthXS={Columns.Twelve}
                  widthSM={Columns.Six}
                  widthMD={Columns.Four}
                  widthLG={Columns.Three}
                >
                  <OrgLimitStat name={n} value={v.maxAllowed} />
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
            <OrgLimitStat name={name} value={value.maxAllowed} />
          </Grid.Column>
        )
      })}
    </Grid>
  )
}

export default OrgLimits

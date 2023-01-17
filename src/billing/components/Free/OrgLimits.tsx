// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Columns, Grid} from '@influxdata/clockface'

// Components
import OrgLimitStat from 'src/billing/components/Free/OrgLimitStat'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'
import {Limit} from 'src/cloud/actions/limits'
import {LimitsState} from 'src/cloud/reducers/limits'

enum LimitNames {
  Buckets = 'buckets',
  Endpoints = 'endpoints',
  MaxRetentionSeconds = 'maxRetentionSeconds',
  OrgID = 'orgID',
  Rate = 'rate',
  Status = 'status',
}

interface LimitCardProps {
  limitName: string
  limitValue: Limit
}

const removeUnrenderedProps = (orgLimits: LimitsState | {}) =>
  Object.entries(orgLimits).filter(
    ([limitName]) =>
      limitName !== LimitNames.OrgID &&
      limitName !== LimitNames.Status &&
      limitName !== LimitNames.Endpoints
  )

const LimitCard: FC<LimitCardProps> = ({limitName, limitValue}) => {
  return (
    <Grid.Column
      key={limitName}
      widthXS={Columns.Twelve}
      widthSM={Columns.Six}
      widthMD={Columns.Four}
      widthLG={Columns.Three}
    >
      <OrgLimitStat name={limitName} value={limitValue.maxAllowed} />
    </Grid.Column>
  )
}

export const OrgLimits: FC = () => {
  const orgLimits = useSelector((state: AppState) => state.cloud?.limits ?? {})
  const orgUsesIOx = useSelector(isOrgIOx)

  return (
    <Grid>
      {removeUnrenderedProps(orgLimits).map(limit => {
        const [limitName, limitValue] = limit

        // The "Rate" category includes multiple object literal 'limits', each with its own 'limitStatus.'
        if (limitName === LimitNames.Rate) {
          const hiddenLimits = ['queryTime']
          // IOx orgs have no cardinality limit.
          if (orgUsesIOx) {
            hiddenLimits.push('cardinality')
          }

          return Object.keys(limitValue)
            .filter(sublimitName => !hiddenLimits.includes(sublimitName))
            .map(sublimitName => {
              return (
                <LimitCard
                  key={sublimitName}
                  limitName={sublimitName}
                  limitValue={limitValue[sublimitName]}
                />
              )
            })
        }

        // The "Buckets" category is one object literal with two sublimits and a shared 'limitStatus.'
        if (limitName === LimitNames.Buckets) {
          const maxBucketsLimit = limitValue
          const maxRetentionLimit = {
            maxAllowed: limitValue.maxRetentionSeconds,
            limitStatus: limitValue.limitStatus,
          }

          return (
            <div key={`${LimitNames.Buckets}-limits`}>
              <LimitCard
                key={LimitNames.Buckets}
                limitName={LimitNames.Buckets}
                limitValue={maxBucketsLimit}
              />
              <LimitCard
                key={LimitNames.MaxRetentionSeconds}
                limitName={LimitNames.MaxRetentionSeconds}
                limitValue={maxRetentionLimit}
              />
            </div>
          )
        }

        // By default, any 'limit' is a single object literal containing one limitStatus.
        return (
          <LimitCard
            key={limitName}
            limitName={limitName}
            limitValue={limitValue}
          />
        )
      })}
    </Grid>
  )
}

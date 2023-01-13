// Libraries
import React, {FC} from 'react'
import {
  ComponentSize,
  FlexBox,
  AlignItems,
  FlexDirection,
} from '@influxdata/clockface'

// Components
import UsageProvider from 'src/usage/context/usage'
import UsageResults from 'src/usage/UsageResults'
import {RateLimits} from 'src/usage/RateLimits'
import BillingStatsPanel from 'src/usage/BillingStatsPanel'
import UsageTimeRangeDropdown from 'src/usage/UsageTimeRangeDropdown'

export const UsageToday: FC = () => (
  <FlexBox
    alignItems={AlignItems.Stretch}
    direction={FlexDirection.Column}
    margin={ComponentSize.Small}
  >
    <UsageProvider>
      <>
        <BillingStatsPanel />
        <UsageTimeRangeDropdown />
        <UsageResults />
        <RateLimits />
      </>
    </UsageProvider>
  </FlexBox>
)

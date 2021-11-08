// Libraries
import React, {FC, memo, useMemo} from 'react'

import {
  Panel,
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'
import VersionInfo from 'src/shared/components/VersionInfo'

// Types

import DocSearchWidget from 'src/me/components/DocSearchWidget'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import LogoutButton from 'src/me/components/LogoutButton'
import DashboardsList from 'src/me/components/DashboardsList'
import GetResources from 'src/resources/components/GetResources'
import {ResourceType} from 'src/types'
import UsagePanel from './UsagePanel'
import UsageProvider from 'src/usage/context/usage'
import {useSelector} from 'react-redux'
import {getMe} from '../selectors'

const ResourceLists: FC = () => {
  const {quartzMe} = useSelector(getMe)
  const creditDaysRemaining = useMemo(() => {
    const startDate = new Date(quartzMe?.paygCreditStartDate)
    const current = new Date()
    const diffTime = Math.abs(current.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return 30 - diffDays
  }, [quartzMe?.paygCreditStartDate])

  const paygCreditEnabled = creditDaysRemaining > 0 && creditDaysRemaining <= 30

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      stretchToFitWidth={true}
      margin={ComponentSize.Small}
    >
      {isFlagEnabled('docSearchWidget') ? (
        <Panel testID="documentation--panel">
          <Panel.Header>
            <Heading element={HeadingElement.H3} weight={FontWeight.Medium}>
              <label htmlFor="documentation">Documentation</label>
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <DocSearchWidget />
          </Panel.Body>
        </Panel>
      ) : (
        <>
          <Panel>
            <Panel.Header style={{paddingBottom: '24px'}}>
              <Heading element={HeadingElement.H3}>Account</Heading>
              <LogoutButton />
            </Panel.Header>
          </Panel>
          <Panel testID="recent-dashboards--panel">
            <Panel.Header>
              <Heading element={HeadingElement.H3}>
                <label htmlFor="filter-dashboards">Recent Dashboards</label>
              </Heading>
            </Panel.Header>
            <Panel.Body>
              <GetResources resources={[ResourceType.Dashboards]}>
                <DashboardsList />
              </GetResources>
            </Panel.Body>
          </Panel>
        </>
      )}
      {isFlagEnabled('paygCheckoutCredit') && paygCreditEnabled && (
        <UsageProvider>
          <UsagePanel />
        </UsageProvider>
      )}
      <Panel>
        <Panel.Footer>
          <VersionInfo />
        </Panel.Footer>
      </Panel>
    </FlexBox>
  )
}

export default memo(ResourceLists)

// Libraries
import React, {FC, memo, useContext} from 'react'
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

// Types
import {ResourceType} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {UsageContext} from 'src/usage/context/usage'

// Components
import UsagePanel from 'src/me/components/UsagePanel'
import DocSearchWidget from 'src/me/components/DocSearchWidget'
import LogoutButton from 'src/me/components/LogoutButton'
import DashboardsList from 'src/me/components/DashboardsList'
import GetResources from 'src/resources/components/GetResources'
import VersionInfo from 'src/shared/components/VersionInfo'

const ResourceLists: FC = () => {
  const {paygCreditEnabled} = useContext(UsageContext)

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
      {isFlagEnabled('uiUnificationFlag') &&
        isFlagEnabled('paygCheckoutCredit') &&
        paygCreditEnabled && <UsagePanel />}
      <Panel>
        <Panel.Footer>
          <VersionInfo />
        </Panel.Footer>
      </Panel>
    </FlexBox>
  )
}

export default memo(ResourceLists)

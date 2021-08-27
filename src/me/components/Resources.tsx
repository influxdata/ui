// Libraries
import React, {FC, memo} from 'react'

// Components
import UsagePanel from 'src/me/components/UsagePanel'
import Support from 'src/me/components/Support'
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
import {CLOUD} from 'src/shared/constants'

// Selectors
import {useSelector} from 'react-redux'
import {getMe} from 'src/me/selectors'

const ResourceLists: FC = () => {
  const {quartzMe} = useSelector(getMe)
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
            <Heading
              element={HeadingElement.H2}
              weight={FontWeight.Medium}
              className="cf-heading__h4"
            >
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
            <Panel.Header>
              <Heading
                element={HeadingElement.H2}
                weight={FontWeight.Light}
                className="cf-heading__h4"
              >
                Account
              </Heading>
              <LogoutButton />
            </Panel.Header>
          </Panel>
          <Panel testID="recent-dashboards--panel">
            <Panel.Header>
              <Heading
                element={HeadingElement.H2}
                weight={FontWeight.Light}
                className="cf-heading__h4"
              >
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
      <Panel>
        <Panel.Footer>
          <VersionInfo />
        </Panel.Footer>
      </Panel>
    </FlexBox>
  )
}

export default memo(ResourceLists)

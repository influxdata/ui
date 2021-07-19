// Libraries
import React, {PureComponent} from 'react'

// Components
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
import {AppState, ResourceType} from 'src/types'

interface Props {
  me: AppState['me']
}

class ResourceLists extends PureComponent<Props> {
  public render() {
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
          <Panel.Header>
            <Heading
              element={HeadingElement.H2}
              weight={FontWeight.Light}
              className="cf-heading__h4"
            >
              Useful Links
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Support />
          </Panel.Body>
          <Panel.Footer>
            <VersionInfo />
          </Panel.Footer>
        </Panel>
      </FlexBox>
    )
  }
}

export default ResourceLists

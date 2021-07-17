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
import {AppState} from 'src/types'

import DocSearchWidget from 'src/me/components/DocSearchWidget'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
        <Panel testID="recent-dashboards--panel">
          <Panel.Header>
            <Heading
              element={HeadingElement.H2}
              weight={FontWeight.Medium}
              className="cf-heading__h4"
            >
              <label htmlFor="documentation-search">Documentation</label>
            </Heading>
          </Panel.Header>
          {isFlagEnabled('docSearchWidget') && (
            <Panel.Body>
              <DocSearchWidget />
            </Panel.Body>
          )}
        </Panel>
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

// Libraries
import React, {FC, memo, useContext} from 'react'
import {
  Panel,
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {UsageContext} from 'src/usage/context/usage'

// Components
import UsagePanel from 'src/me/components/UsagePanel'
import DocSearchWidget from 'src/me/components/DocSearchWidget'
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
      <Panel testID="documentation--panel">
        <Panel.Body>
          <DocSearchWidget />
        </Panel.Body>
      </Panel>
      {isFlagEnabled('uiUnificationFlag') && paygCreditEnabled && (
        <UsagePanel />
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

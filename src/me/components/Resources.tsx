// Libraries
import React, {CSSProperties, FC, memo, useContext} from 'react'
import {
  Panel,
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'

// Utils
import {CLOUD} from 'src/shared/constants'
import {UsageContext} from 'src/usage/context/usage'

// Components
import UsagePanel from 'src/me/components/UsagePanel'
import DocSearchWidget from 'src/me/components/DocSearchWidget'
import VersionInfo from 'src/shared/components/VersionInfo'

type OwnProps = {
  style?: CSSProperties
}

const ResourceLists: FC<OwnProps> = (props: OwnProps) => {
  const {paygCreditEnabled} = useContext(UsageContext)

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      stretchToFitWidth={true}
      margin={ComponentSize.Small}
    >
      <Panel testID="documentation--panel">
        <Panel.Body style={props.style}>
          <DocSearchWidget />
        </Panel.Body>
      </Panel>
      {CLOUD && paygCreditEnabled && <UsagePanel />}
      <Panel>
        <Panel.Footer style={props.style}>
          <VersionInfo />
        </Panel.Footer>
      </Panel>
    </FlexBox>
  )
}

export default memo(ResourceLists)

import React, {FC} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexDirection,
  Gradients,
  Icon,
  IconFont,
  JustifyContent,
  Panel,
} from '@influxdata/clockface'

const WarningPanel: FC = () => (
  <Panel
    gradient={Gradients.LostGalaxy}
    testID="panel"
    border={true}
    style={{marginBottom: '8px'}}
  >
    <Panel.Body
      justifyContent={JustifyContent.FlexStart}
      alignItems={AlignItems.Center}
      direction={FlexDirection.Row}
      margin={ComponentSize.Large}
      size={ComponentSize.ExtraSmall}
      style={{padding: '8px 12px'}}
    >
      <Icon glyph={IconFont.AlertTriangle} />
      <p className="margin-zero">
        <strong>NOTE:</strong> Changes made to an existing task cannot be undone
      </p>
    </Panel.Body>
  </Panel>
)

export default WarningPanel

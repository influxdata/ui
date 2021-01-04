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
    className="flow-visualization--export-warning"
  >
    <Panel.Body
      justifyContent={JustifyContent.FlexStart}
      alignItems={AlignItems.Center}
      direction={FlexDirection.Row}
      margin={ComponentSize.Medium}
      size={ComponentSize.ExtraSmall}
    >
      <Icon glyph={IconFont.AlertTriangle} />
      <p className="margin-zero">
        Note: changes made to existing dashboard cells cannot be undone
      </p>
    </Panel.Body>
  </Panel>
)

export default WarningPanel

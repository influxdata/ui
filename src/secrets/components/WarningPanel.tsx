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

interface Props {
  warningText: string
}

const WarningPanel: FC<Props> = ({warningText}) => (
  <Panel
    gradient={Gradients.LostGalaxy}
    testID="panel"
    border={true}
    className="warning-panel"
  >
    <Panel.Body
      justifyContent={JustifyContent.FlexStart}
      alignItems={AlignItems.Center}
      direction={FlexDirection.Row}
      margin={ComponentSize.ExtraSmall}
      size={ComponentSize.ExtraSmall}
    >
      <Icon glyph={IconFont.AlertTriangle} className="warning-panel-icon" />
      <p className="warning-panel-text margin-top-zero">{warningText}</p>
    </Panel.Body>
  </Panel>
)

export default WarningPanel

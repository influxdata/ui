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
      <Icon glyph={IconFont.AlertTriangle} className="warning-panel-icon" />
      <p className="margin-zero">{warningText}</p>
    </Panel.Body>
  </Panel>
)

export default WarningPanel

import React from 'react'
import {
  ComponentSize,
  FlexBox,
  Icon,
  IconFont,
  JustifyContent,
  AppHeader,
} from '@influxdata/clockface'

const globalHeaderStyle = {
  padding: '0 32px 0 32px',
  margin: '24px 0 24px 0',
}

class GlobalHeader extends React.Component<any, any> {
  render() {
    return (
      <FlexBox
        margin={ComponentSize.Large}
        justifyContent={JustifyContent.SpaceBetween}
        style={globalHeaderStyle}
      >
        <FlexBox margin={ComponentSize.Medium}>
          <div>Org Dropdown</div>
          <Icon glyph={IconFont.CaretRight}></Icon>
          <div>Account Dropdown</div>
        </FlexBox>
        <div>
          User Icon
        </div>
      </FlexBox>
    )
  }
}

export default GlobalHeader

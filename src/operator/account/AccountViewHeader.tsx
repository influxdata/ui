// Libraries
import React, {FC} from 'react'
import {
  IconFont,
  FlexBox,
  FlexDirection,
  ComponentSize,
  Icon,
} from '@influxdata/clockface'
import {Link} from 'react-router-dom'

const AccountViewHeader: FC = () => {
  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Large}
      stretchToFitWidth={true}
    >
      <FlexBox.Child>
        <Link to="/operator" data-testid="account-view--back-button">
          <Icon glyph={IconFont.CaretLeft_New} />
          Back to Account List
        </Link>
      </FlexBox.Child>
    </FlexBox>
  )
}

export default AccountViewHeader

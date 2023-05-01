import React, {FC} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
} from '@influxdata/clockface'

interface OwnProps {
  children?: JSX.Element | JSX.Element[]
}

export const AnnouncementCenter: FC<OwnProps> = (props: OwnProps) => {
  return (
    <FlexBox
      className="announcement-center"
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      margin={ComponentSize.Medium}
    >
      {props.children}
    </FlexBox>
  )
}

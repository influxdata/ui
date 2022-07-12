// rename this later

// Libraries
import React, {FC} from 'react'

// Components
import {
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'

import './style.scss'

interface Props {
  label: string
  src: string
}

const LabeledUserData: FC<Props> = ({label, src}) => (
  <FlexBox
    direction={FlexDirection.Column}
    margin={ComponentSize.Large}
    alignItems={AlignItems.FlexStart}
    style={{
      marginRight: '35px',
    }}
  >
    <Heading
      className="org-profile-tab--heading"
      element={HeadingElement.H4}
      weight={FontWeight.Medium}
    >
      {label}
    </Heading>
    <div
      style={{
        fontWeight: FontWeight.Medium,
        width: '200px',
        border: '2px solid #333346',
        borderRadius: '2px',
        padding: '12px',
        marginBottom: '10px',
      }}
    >
      {src}
    </div>
  </FlexBox>
)

export default LabeledUserData

// Libraries
import React, {FC} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  FontWeight,
  Heading,
  HeadingElement,
} from '@influxdata/clockface'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

interface Props {
  label: string
  src: string
}

const LabeledUserData: FC<Props> = ({label, src}) => (
  <FlexBox
    direction={FlexDirection.Column}
    margin={ComponentSize.Large}
    alignItems={AlignItems.FlexStart}
    className="user-data-field--container"
  >
    <Heading
      className="user-data-field--header"
      element={HeadingElement.H6}
      weight={FontWeight.Medium}
    >
      {label}
    </Heading>
    <div
      style={{
        fontWeight: FontWeight.Medium,
        width: '300px',
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

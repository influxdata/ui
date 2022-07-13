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
  data: string
}

const userDataStyle = {fontWeight: FontWeight.Medium}

const LabeledUserData: FC<Props> = ({label, data}) => (
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
    <div className="user-data-field--data" style={userDataStyle}>
      {data}
    </div>
  </FlexBox>
)

export default LabeledUserData

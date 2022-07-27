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
  InfluxColors,
} from '@influxdata/clockface'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

interface Props {
  label: string
  data: string
  headingColor?: InfluxColors
  textColor?: InfluxColors
}

const LabeledUserData: FC<Props> = ({label, data, headingColor, textColor}) => (
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
      style={{color: headingColor}}
    >
      {label}
    </Heading>
    <div
      className="user-data-field--default-account-org"
      style={{fontWeight: FontWeight.Medium, color: textColor}}
    >
      {data}
    </div>
  </FlexBox>
)

export default LabeledUserData

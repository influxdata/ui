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

interface Props {
  label: string
  src: string
  testID: string
}

const LabeledData: FC<Props> = ({label, src, testID}) => (
  <FlexBox
    direction={FlexDirection.Column}
    margin={ComponentSize.Large}
    alignItems={AlignItems.FlexStart}
    testID={testID}
  >
    <Heading
      className="org-profile-tab--heading"
      element={HeadingElement.H4}
      weight={FontWeight.Regular}
    >
      {label}
    </Heading>
    <span style={{fontWeight: FontWeight.Light, width: '100%'}}>{src}</span>
  </FlexBox>
)

export default LabeledData

// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {
  AlignItems,
  Heading,
  HeadingElement,
  FlexBox,
  FlexDirection,
  FontWeight,
  JustifyContent,
} from '@influxdata/clockface'

// Components
import LabeledUserData from 'src/identity/components/userprofile/LabeledUserData'

// Selectors
import {selectQuartzIdentity} from 'src/identity/selectors/index'

export const UserDetails: FC = () => {
  const identity = useSelector(selectQuartzIdentity)
  const user = identity.currentIdentity.user
  return (
    <FlexBox
      direction={FlexDirection.Column}
      className="user-details-container--main"
      alignItems={AlignItems.FlexStart}
    >
      <Heading
        weight={FontWeight.Bold}
        element={HeadingElement.H4}
        className="user-details-container--header"
      >
        User Details
      </Heading>

      <LabeledUserData label="Email" data={user.email} />

      <FlexBox
        direction={FlexDirection.Row}
        className="user-details-container--username"
        alignItems={AlignItems.FlexStart}
        justifyContent={JustifyContent.FlexStart}
      >
        <LabeledUserData label="First name" data={user.firstName} />
        <LabeledUserData label="Last name" data={user.lastName} />
      </FlexBox>
    </FlexBox>
  )
}

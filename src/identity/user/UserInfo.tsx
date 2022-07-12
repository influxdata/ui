import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {
  Heading,
  FlexBox,
  FontWeight,
  HeadingElement,
  AlignItems,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'
import LabeledUserData from 'src/identity/user/LabeledUserData'
import {selectQuartzIdentity} from '../selectors'

const fullWidth = {width: '100%'}
const sixtyPercentWidth = {width: '60%'}
const headerMargin = {marginTop: '40px', marginBottom: '15px'}

export const UserInfo: FC = () => {
  const identity = useSelector(selectQuartzIdentity)
  const user = identity.currentIdentity.user

  return (
    <>
      <FlexBox
        direction={FlexDirection.Column}
        style={fullWidth}
        alignItems={AlignItems.FlexStart}
      >
        <Heading
          weight={FontWeight.Bold}
          element={HeadingElement.H3}
          selectable={false}
          style={headerMargin}
        >
          User Details
        </Heading>
        <LabeledUserData label="Email" src={user.email} />
        <FlexBox
          direction={FlexDirection.Row}
          style={sixtyPercentWidth}
          alignItems={AlignItems.FlexStart}
          justifyContent={JustifyContent.FlexStart}
        >
          <LabeledUserData label="First name" src={user.firstName} />
          <LabeledUserData label="Last name" src={user.lastName} />
        </FlexBox>
      </FlexBox>
    </>
  )
}

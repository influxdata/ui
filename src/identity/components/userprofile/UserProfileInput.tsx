// Libraries
import React, {FC} from 'react'

// Components
import {ComponentStatus, InfluxColors, Input, Form} from '@influxdata/clockface'

// Styles
import 'src/identity/components/userprofile/UserProfile.scss'

interface Props {
  status: ComponentStatus
  header: string
  text: string
  testID: string
  inputTestID: string
}

const inputStyle = {
  width: '368px',
  backgroundColor: 'black',
  color: InfluxColors.White,
}

export const UserProfileInput: FC<Props> = ({
  status,
  header,
  text,
  testID,
  inputTestID,
}) => (
  <Form.Element
    label={header}
    className="user-profile-page--form-element"
    testID={testID}
  >
    <Input
      status={status}
      value={text}
      inputStyle={inputStyle}
      testID={inputTestID}
    />
  </Form.Element>
)

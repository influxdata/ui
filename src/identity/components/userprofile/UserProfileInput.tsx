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
}

const inputStyle = {
  width: '368px',
  backgroundColor: 'black',
  color: InfluxColors.White,
}

export const UserProfileInput: FC<Props> = ({status, header, text}) => (
  <Form.Element label={header} className="user-profile-page--form-element">
    <Input status={status} value={text} inputStyle={inputStyle} />
  </Form.Element>
)

// Libraries
import React, {FC} from 'react'

// Components
import {
  Input,
  Form,
  InputType,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
}

const UserInput: FC<Props> = ({formContent, updateForm}) => (
  <FlexBox
    alignItems={AlignItems.FlexStart}
    direction={FlexDirection.Row}
    margin={ComponentSize.Large}
    className="create-broker-form__creds"
  >
    <Form.Element label="Username">
      <Input
        type={InputType.Text}
        placeholder="userName"
        name="username"
        value={formContent.brokerUsername}
        onChange={e =>
          updateForm({
            ...formContent,
            brokerUsername: e.target.value,
          })
        }
        testID="create-broker-form--username"
      />
    </Form.Element>
    <Form.Element label="Password">
      <Input
        type={InputType.Text}
        placeholder="*********"
        name="password"
        value={formContent.brokerPassword}
        onChange={e =>
          updateForm({
            ...formContent,
            brokerPassword: e.target.value,
          })
        }
        testID="create-broker-form--password"
      />
    </Form.Element>
  </FlexBox>
)
export default UserInput

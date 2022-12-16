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
  ComponentStatus,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
  className: string
  edit: boolean
}

const UserInput: FC<Props> = ({formContent, updateForm, className, edit}) => (
  <FlexBox
    alignItems={AlignItems.FlexStart}
    direction={FlexDirection.Row}
    margin={ComponentSize.Large}
    className={`${className}-broker-form__creds`}
  >
    <Form.ValidationElement
      label="Username"
      required={true}
      validationFunc={() =>
        handleValidation('Username', formContent.brokerUsername)
      }
      value={formContent.brokerUsername}
    >
      {status => (
        <Input
          type={InputType.Text}
          placeholder="username"
          name="username"
          value={formContent?.brokerUsername ?? ''}
          onChange={e =>
            updateForm({
              ...formContent,
              brokerUsername: e.target.value,
            })
          }
          testID={`${className}-broker-form--username`}
          status={
            edit || className === 'create' ? status : ComponentStatus.Disabled
          }
          maxLength={255}
        />
      )}
    </Form.ValidationElement>
    <Form.ValidationElement
      label="Password"
      required={true}
      value={formContent.brokerPassword}
      validationFunc={() =>
        handleValidation('Password', formContent.brokerPassword)
      }
    >
      {status => (
        <Input
          type={InputType.Password}
          placeholder="*********"
          name="password"
          required={true}
          value={formContent?.brokerPassword ?? ''}
          onChange={e =>
            updateForm({
              ...formContent,
              brokerPassword: e.target.value,
            })
          }
          testID={`${className}-broker-form--password`}
          status={
            edit || className === 'create' ? status : ComponentStatus.Disabled
          }
        />
      )}
    </Form.ValidationElement>
  </FlexBox>
)
export default UserInput

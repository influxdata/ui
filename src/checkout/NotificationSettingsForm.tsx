import React, {FC, useContext} from 'react'
import {
  Columns,
  Form,
  Grid,
  IconFont,
  InputToggleType,
  InputType,
} from '@influxdata/clockface'

// Components
import FormInput from 'src/checkout/shared/FormInput'
import FormToggle from 'src/checkout/shared/FormToggle'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

const NotificationSettingsForm: FC = () => {
  const {inputs} = useContext(CheckoutContext)

  return (
    <>
      <FormToggle
        icon={IconFont.Checkmark}
        id="shouldNotify"
        label="Send an email notification when my usage exceeds the limit I have set"
        tabIndex={0}
        type={InputToggleType.Checkbox}
      />
      {inputs.shouldNotify && (
        <Form.Box>
          <Grid.Row>
            <Grid.Column widthSM={Columns.Six}>
              <FormInput
                id="notifyEmail"
                label="Email address"
                required
                type={InputType.Email}
              />
            </Grid.Column>
            <Grid.Column widthSM={Columns.Three}>
              <FormInput
                id="balanceThreshold"
                label="Limit ($1 minimum)"
                min={1}
                required
                step={0.01}
                type={InputType.Number}
              />
            </Grid.Column>
          </Grid.Row>
        </Form.Box>
      )}
    </>
  )
}

export default NotificationSettingsForm

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

// Constants
import {MINIMUM_BALANCE_THRESHOLD} from 'src/shared/constants'

const NotificationSettingsForm: FC = () => {
  const {inputs} = useContext(CheckoutContext)

  return (
    <>
      <FormToggle
        icon={IconFont.Checkmark_New}
        id="shouldNotify"
        label="Send me an email when my bill exceeds a certain amount"
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
                label={`Amount (${MINIMUM_BALANCE_THRESHOLD} minimum)`}
                min={MINIMUM_BALANCE_THRESHOLD}
                required
                step={1}
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

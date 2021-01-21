import React, {FC} from 'react'
import {useFormikContext} from 'formik'
import {
  Columns,
  Form,
  Grid,
  IconFont,
  InputToggleType,
  InputType,
} from '@influxdata/clockface'

import FormInput from 'src/checkout/shared/FormInput'
import FormToggle from 'src/checkout/shared/FormToggle'
import {minimumBalanceThreshold} from 'src/checkout/utils/notificationSettings'

const NotificationSettingsForm: FC = () => {
  const {
    values: {shouldNotify},
  } = useFormikContext()

  return (
    <>
      <FormToggle
        icon={IconFont.Checkmark}
        id="shouldNotify"
        label="Send an email notification when my usage exceeds the limit I have set"
        tabIndex={0}
        type={InputToggleType.Checkbox}
      />
      {shouldNotify && (
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
                label={`Limit ($${minimumBalanceThreshold} minimum)`}
                min={minimumBalanceThreshold}
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

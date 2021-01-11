// Libraries
import React, {FC} from 'react'
// Components
import {ErrorNotification} from './ErrorNotification'
import {WarningAlert} from './WarningAlert'

export const OnboardingError: FC = () => {
  return (
    <>
      <ErrorNotification>Account could not be created.</ErrorNotification>

      <WarningAlert>
        <span>
          There was an issue setting up your account, please try again in a
          moment. If this issue persists, <br />
          please email support at{' '}
          <a href="mailto:support@influxdata.com">support@influxdata.com</a>
        </span>
      </WarningAlert>
    </>
  )
}

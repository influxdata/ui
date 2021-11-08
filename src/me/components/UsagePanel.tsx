// Libraries
import React, {FC, useContext} from 'react'
import {
  ProgressBar,
  Gradients,
  InfluxColors,
  Panel,
  HeadingElement,
  Heading,
} from '@influxdata/clockface'

// Contexts
import {UsageContext} from 'src/usage/context/usage'

const MAX_CREDIT = 250
const CREDIT_DAYS = 30

const UsagePanel: FC = () => {
  const {creditUsage, creditDaysRemaining} = useContext(UsageContext)

  return (
    <Panel>
      <Panel.Header>
        <Heading element={HeadingElement.H3}>
          <label htmlFor="usagepanel--title">Usage</label>
        </Heading>
      </Panel.Header>
      <Panel.Body>
        <ProgressBar
          value={creditUsage}
          max={MAX_CREDIT}
          barGradient={Gradients.HotelBreakfast}
          color={InfluxColors.Wasabi}
          label="Credit Usage"
          valueText={`$${creditUsage}`}
          maxText={`$${MAX_CREDIT} credit`}
        />
        <ProgressBar
          className="customprogress"
          value={CREDIT_DAYS - creditDaysRemaining}
          max={CREDIT_DAYS}
          barGradient={
            creditDaysRemaining > 15
              ? Gradients.HotelBreakfast
              : Gradients.DangerDark
          }
          color={
            creditDaysRemaining > 15
              ? InfluxColors.Wasabi
              : InfluxColors.Curacao
          }
          label="Credit Period"
          valueText={`${creditDaysRemaining}`}
          maxText={`${CREDIT_DAYS} days remaining`}
        />
      </Panel.Body>
    </Panel>
  )
}

export default UsagePanel

// Libraries
import React, {FC, useContext} from 'react'
import {
  ProgressBar,
  Gradients,
  InfluxColors,
  Panel,
  HeadingElement,
  Heading,
  TechnoSpinner,
  JustifyContent,
  AlignItems,
} from '@influxdata/clockface'

// Contexts
import {UsageContext} from 'src/usage/context/usage'

// Constants
import {PAYG_CREDIT_DAYS, PAYG_MAX_CREDIT} from 'src/shared/constants'

// Types
import {RemoteDataState} from 'src/types'

const UsagePanel: FC = () => {
  const {creditUsage, creditDaysRemaining} = useContext(UsageContext)

  const getUsageBars = () => {
    return (
      <Panel.Body>
        <ProgressBar
          value={creditUsage?.amount}
          max={PAYG_MAX_CREDIT}
          barGradient={Gradients.HotelBreakfast}
          color={InfluxColors.Wasabi}
          label="Credit Usage"
          valueText={`$${creditUsage?.amount}`}
          maxText={`$${PAYG_MAX_CREDIT} credit`}
        />
        <ProgressBar
          value={PAYG_CREDIT_DAYS - creditDaysRemaining}
          max={PAYG_CREDIT_DAYS}
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
          maxText={`${PAYG_CREDIT_DAYS} days remaining`}
        />
      </Panel.Body>
    )
  }

  return (
    <Panel>
      <Panel.Header>
        <Heading element={HeadingElement.H3}>
          <label htmlFor="usagepanel--title">Usage</label>
        </Heading>
      </Panel.Header>
      {creditUsage.status === RemoteDataState.Loading ? (
        <Panel.Body
          justifyContent={JustifyContent.Center}
          alignItems={AlignItems.Center}
        >
          <TechnoSpinner />
        </Panel.Body>
      ) : (
        getUsageBars()
      )}
    </Panel>
  )
}

export default UsagePanel

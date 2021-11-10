// Libraries
import React, {FC, useContext} from 'react'
import {ProgressBar, Gradients, InfluxColors} from '@influxdata/clockface'

// Contexts
import {UsageContext} from 'src/usage/context/usage'

// Constants
import {PAYG_CREDIT_DAYS, PAYG_MAX_CREDIT} from 'src/shared/constants'

// Types

const UsagePanelDetails: FC = () => {
  const {creditUsage, creditDaysRemaining} = useContext(UsageContext)

  return (
    <>
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
          creditDaysRemaining > 15 ? InfluxColors.Wasabi : InfluxColors.Curacao
        }
        label="Credit Period"
        valueText={`${creditDaysRemaining}`}
        maxText={`${PAYG_CREDIT_DAYS} days remaining`}
      />
    </>
  )
}

export default UsagePanelDetails

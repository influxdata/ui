import React, {FC, useContext} from 'react'
import {CTAButton, ComponentColor} from '@influxdata/clockface'
import {CheckoutContext} from 'src/checkout/context/checkout'
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'
import {getDataLayerIdentity} from 'src/cloud/utils/experiments'
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const CancelButton: FC = () => {
  const {handleCancelClick} = useContext(CheckoutContext)

  const original = (
    <CTAButton
      color={ComponentColor.Default}
      onClick={handleCancelClick}
      text="Cancel"
      id="button-cancel" // for google-analytics
      testID="checkout-cancel--button"
    />
  )

  const handleCancelCredit250Click = () => {
    const identity = getDataLayerIdentity()
    event('checkout.cancel.credit-250.upgrade', {
      location: 'checkout',
      ...identity,
      experimentId: CREDIT_250_EXPERIMENT_ID,
      experimentVariantId: '1',
    })
    handleCancelClick()
  }

  if (isFlagEnabled('credit250Experiment')) {
    return (
      <GoogleOptimizeExperiment
        experimentID={CREDIT_250_EXPERIMENT_ID}
        original={original}
        variants={[
          <CTAButton
            key="1"
            color={ComponentColor.Default}
            onClick={handleCancelCredit250Click}
            text="Cancel"
            id="button-cancel" // for google-analytics
            testID="checkout-cancel--button"
          />,
        ]}
      />
    )
  }
  return original
}

export default CancelButton

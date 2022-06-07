// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {CTAButton, ComponentColor} from '@influxdata/clockface'

// Components
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

// Utils
import {shouldGetCredit250Experience} from 'src/me/selectors'
import {getDataLayerIdentity} from 'src/cloud/utils/experiments'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

const CancelButton: FC = () => {
  const {handleCancelClick} = useContext(CheckoutContext)
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

  const handleCancelCredit250Click = () => {
    const identity = getDataLayerIdentity()
    event('checkout.cancel.credit-250.upgrade', {
      location: 'checkout',
      ...identity,
      experimentId: CREDIT_250_EXPERIMENT_ID,
      experimentVariantId: isCredit250ExperienceActive ? '2' : '1',
    })
    handleCancelClick()
  }

  const original = (
    <CTAButton
      color={ComponentColor.Default}
      onClick={handleCancelClick}
      text="Cancel"
      id="button-cancel" // for google-analytics
      testID="checkout-cancel--button"
    />
  )

  const credit250Experience = (
    <CTAButton
      key="1"
      color={ComponentColor.Default}
      onClick={handleCancelCredit250Click}
      text="Cancel"
      id="button-cancel" // for google-analytics
      testID="checkout-cancel--button"
    />
  )

  if (isFlagEnabled('credit250Experiment')) {
    if (isCredit250ExperienceActive) {
      return credit250Experience
    }

    return (
      <GoogleOptimizeExperiment
        experimentID={CREDIT_250_EXPERIMENT_ID}
        original={original}
        variants={[credit250Experience]}
      />
    )
  }
  return original
}

export default CancelButton

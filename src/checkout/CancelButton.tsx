// Libraries
import React, {FC, useContext} from 'react'
import {CTAButton, ComponentColor} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

// Utils
import {getDataLayerIdentity} from 'src/cloud/utils/experiments'
import {event} from 'src/cloud/utils/reporting'

const CancelButton: FC = () => {
  const {handleCancelClick} = useContext(CheckoutContext)

  const handleCancelCredit250Click = () => {
    const identity = getDataLayerIdentity()
    event('checkout.cancel.credit-250.upgrade', {
      location: 'checkout',
      ...identity,
    })
    handleCancelClick()
  }

  return (
    <CTAButton
      key="1"
      color={ComponentColor.Default}
      onClick={handleCancelCredit250Click}
      text="Cancel"
      id="button-cancel" // for google-analytics
      testID="checkout-cancel--button"
    />
  )
}

export default CancelButton

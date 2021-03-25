import React, {FC, useContext} from 'react'
import {CTAButton, ComponentColor} from '@influxdata/clockface'
import {CheckoutContext} from 'src/checkout/context/checkout'

const CancelButton: FC = () => {
  const {handleCancelClick} = useContext(CheckoutContext)

  return (
    <CTAButton
      color={ComponentColor.Default}
      onClick={handleCancelClick}
      text="Cancel"
      id="button-cancel" // for google-analytics
      testID="checkout-cancel--button"
    />
  )
}

export default CancelButton

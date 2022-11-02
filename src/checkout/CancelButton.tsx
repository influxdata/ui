// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {CTAButton, ComponentColor} from '@influxdata/clockface'

// Context
import {CheckoutContext} from 'src/checkout/context/checkout'

// Utils
import {shouldGetCredit250Experience} from 'src/me/selectors'
import {event} from 'src/cloud/utils/reporting'

const CancelButton: FC = () => {
  const {handleCancelClick} = useContext(CheckoutContext)
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

  const handleCancelCredit250Click = () => {
    event('checkout.cancel.credit-250.upgrade', {location: 'checkout'})
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

  if (isCredit250ExperienceActive) {
    return credit250Experience
  }
  return original
}

export default CancelButton

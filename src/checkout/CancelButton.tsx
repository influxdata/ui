import React from 'react'
import {CTAButton, ComponentColor} from '@influxdata/clockface'

type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>

interface Props {
  text?: string
  onClick?: (e: ButtonClickEvent) => void
}

const CancelButton: React.FC<Props> = ({text = 'Cancel'}) => {
  const handleClick = e => {
    if (!!window?._abcr) {
      window?._abcr.triggerAbandonedCart()
    }

    window.location.href = '/'
  }

  return (
    <CTAButton
      color={ComponentColor.Default}
      onClick={handleClick}
      text={text}
      id="button-cancel" // for google-analytics
      testID="checkout-cancel--button"
    />
  )
}

export default CancelButton

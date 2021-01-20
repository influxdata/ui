import React from 'react'
import {FormikTouched, useFormikContext} from 'formik'
import {CTAButton, ComponentColor} from '@influxdata/clockface'

import {Checkout} from './utils/checkout'

type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>

interface Props {
  text?: string
  onClick?: (e: ButtonClickEvent) => void
}

const noop = _ => {}

const hasTouch = (touched: FormikTouched<Checkout>) =>
  !!Object.keys(touched).length

const CancelButton: React.FC<Props> = ({onClick = noop, text = 'Cancel'}) => {
  const {touched} = useFormikContext<Checkout>()
  const handleClick = e => {
    if (!!_abcr && hasTouch(touched)) {
      _abcr.triggerAbandonedCart()
    }

    onClick(e)
  }

  return (
    <CTAButton
      color={ComponentColor.Default}
      onClick={handleClick}
      text={text}
      id="button-cancel" // for google-analytics
    />
  )
}

export default CancelButton

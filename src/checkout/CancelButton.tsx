import React from 'react'
import {CTAButton, ComponentColor} from '@influxdata/clockface'

type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>

interface Props {
  text?: string
  onClick?: (e: ButtonClickEvent) => void
}

const noop = _ => {}

const CancelButton: React.FC<Props> = ({onClick = noop, text = 'Cancel'}) => {
  const handleClick = e => {
    if (!!window?._abcr) {
      window?._abcr.triggerAbandonedCart()
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

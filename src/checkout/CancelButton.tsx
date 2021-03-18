import React from 'react'
import {CTAButton, ComponentColor} from '@influxdata/clockface'
import { RouteComponentProps, withRouter } from 'react-router'

type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>

interface OwnProps {
  text?: string
  onClick?: (e: ButtonClickEvent) => void
}

type Props = OwnProps & RouteComponentProps


const CancelButton: React.FC<Props> = ({history, text = 'Cancel'}) => {
  const handleClick = e => {
    if (!!window?._abcr) {
      window?._abcr.triggerAbandonedCart()
    }

    history.push('/')
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

export default withRouter(CancelButton)

import React, {FC, useContext} from 'react'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'
import {BillingContext} from 'src/billing/context/billing'

// Types
import {Marketplace} from 'src/types/billing'

const buttonInfo = (marketplace: Marketplace['shortName']): string => {
  switch (marketplace) {
    case 'aws':
      return 'AWS Subscription Portal'
    case 'gcm':
      return 'Google Cloud Solution'
    case 'azure':
      return 'Microsoft Azure Portal'
    default:
      return ''
  }
}

const MarketplaceLink: FC = () => {
  const {marketplace} = useContext(BillingContext)

  const text = buttonInfo(marketplace.shortName)

  const handleClick = () => {
    window.open(marketplace.url, '_blank')
  }

  return (
    <Button
      shape={ButtonShape.Default}
      onClick={handleClick}
      text={text}
      color={ComponentColor.Primary}
      size={ComponentSize.Small}
    />
  )
}

export default MarketplaceLink

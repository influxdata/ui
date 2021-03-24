import React, {FC} from 'react'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'

import {Marketplace} from 'src/types/marketplace'

// Utils
import {useBilling} from 'src/billing/components/BillingPage'

const buttonInfo = (
  marketplace: Marketplace['shortName']
): {link: string; text: string} => {
  switch (marketplace) {
    case 'aws':
      return {
        link: 'https://aws.amazon.com/marketplace/library/',
        text: 'AWS Subscription Portal',
      }
    case 'gcm':
      return {
        link: 'https://console.cloud.google.com/marketplace/yourSolutions',
        text: 'Google Cloud Solution',
      }
    case 'azure':
      return {
        link:
          'https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade',
        text: 'Microsoft Azure Portal',
      }
    default:
      return {link: '', text: ''}
  }
}

const MarketplaceLink: FC = () => {
  const [{account}] = useBilling()

  const {link, text} = buttonInfo(account.marketplace.shortName)

  const handleClick = () => {
    window.open(link, '_blank')
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

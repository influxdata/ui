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

const buttonInfo = (marketplace: Marketplace): {link: string; text: string} => {
  switch (marketplace) {
    case 'aws':
      return {
        link: 'https://aws.amazon.com/marketplace/library/',
        text: 'Check My AWS Subscription',
      }
    case 'gcm':
      return {
        link: 'https://console.cloud.google.com/marketplace/yourSolutions',
        text: 'Check My Google Cloud Marketplace Subscription',
      }
    case 'azure':
      return {
        link:
          'https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade',
        text: 'Check My Azure Marketplace Subscription',
      }
    default:
      return {link: '', text: ''}
  }
}

const marketplaceLinkText = marketplace => {
  switch (marketplace) {
    case 'aws':
      return 'AWS Subscription Portal'
    case 'gcp':
      return 'Google Cloud Solution'
    case 'azure':
      return 'Microsoft Azure Portal'
  }
}

const MarketplaceLink: FC = () => {
  const [{account}] = useBilling()

  const {link, text: defaultText} = buttonInfo(
    account.marketplace as Marketplace
  )

  const handleClick = () => {
    window.open(link, '_blank')
  }

  return (
    <Button
      shape={ButtonShape.Default}
      onClick={handleClick}
      text={marketplaceLinkText(account.marketplace) || defaultText}
      color={ComponentColor.Primary}
      size={ComponentSize.Small}
    />
  )
}

export default MarketplaceLink

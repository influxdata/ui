import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'

// Types
import {Me} from 'src/client/unityRoutes'

// Utils
import {getQuartzMe} from 'src/me/selectors'

const buttonInfo = (
  marketplace: Me['billingProvider']
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
  const quartzMe = useSelector(getQuartzMe)

  const {link, text} = buttonInfo(quartzMe.billingProvider)

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

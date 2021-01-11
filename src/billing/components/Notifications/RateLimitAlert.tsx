// Libraries
import React, {FC} from 'react'
import classnames from 'classnames'
import _ from 'lodash'

// Components
import {
  FlexBox,
  FlexDirection,
  AlignItems,
  ComponentSize,
  Gradients,
  IconFont,
  BannerPanel,
  InfluxColors,
} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import RateLimitAlertFreeContent from 'src/billing/components/Notifications/RateLimitAlertFreeContent'
import RateLimitAlertPaidContent from './RateLimitAlertPaidContent'

// Hooks
import {useBilling} from 'src/billing/components/BillingPage'

interface Props {
  className?: string
}

const RateLimitAlert: FC<Props> = ({className}) => {
  const [{account, limitsStatus}] = useBilling()
  const rateLimitAlertClass = classnames('rate-alert', className)

  const isCardinalityExceeded = limitsStatus.cardinality.status === 'exceeded'

  const isFreeAccount = account.type === 'free'

  if (isCardinalityExceeded) {
    return (
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        className={rateLimitAlertClass}
      >
        <BannerPanel
          size={ComponentSize.ExtraSmall}
          gradient={Gradients.PolarExpress}
          icon={IconFont.Cloud}
          hideMobileIcon={true}
          textColor={InfluxColors.Yeti}
        >
          {isFreeAccount ? (
            <RateLimitAlertFreeContent />
          ) : (
            <RateLimitAlertPaidContent />
          )}
        </BannerPanel>
      </FlexBox>
    )
  }

  if (isFreeAccount) {
    return <CloudUpgradeButton className="upgrade-payg--button__header" />
  }

  return null
}

export default RateLimitAlert

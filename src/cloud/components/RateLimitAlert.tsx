// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'

// Components
import {
  FlexBox,
  FlexDirection,
  AlignItems,
  ComponentSize,
  IconFont,
  Gradients,
  InfluxColors,
  BannerPanel,
  Button,
  ComponentColor,
} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

// Utils
import {
  extractRateLimitResources,
  extractRateLimitStatus,
} from 'src/cloud/utils/limits'
import {event} from 'src/cloud/utils/reporting'

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import RateLimitAlertContent from 'src/cloud/components/RateLimitAlertContent'

import {notify} from 'src/shared/actions/notifications'
import {writeLimitReached} from 'src/shared/copy/notifications'

// Selectors
import {shouldShowUpgradeButton} from 'src/me/selectors'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {UpgradeContent} from 'src/cloud/components/RateLimitAlertContent'

import './RateLimitAlert.scss'

interface Props {
  alertOnly?: boolean
  className?: string
  location?: string
}

const RateLimitAlert: FC<Props> = ({alertOnly, className, location}) => {
  const resources = useSelector(extractRateLimitResources)
  const status = useSelector(extractRateLimitStatus)
  const showUpgrade = useSelector(shouldShowUpgradeButton)
  const dispatch = useDispatch()

  const appearOverlay = () => {
    dispatch(showOverlay('write-limit', null, () => dispatch(dismissOverlay)))
  }

  useEffect(() => {
    if (CLOUD && status === 'exceeded' && resources.includes('write')) {
      if (showUpgrade) {
        dispatch(
          notify(
            writeLimitReached(
              '',
              <UpgradeContent
                type="write"
                link="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/optimize-writes/"
                className="flex-upgrade-content"
              />
            )
          )
        )
      } else {
        dispatch(
          notify(
            writeLimitReached(
              "Data in has stopped because you've hit the query write limit. Let's get it flowing again: ",
              <Button
                className="rate-alert-overlay-button"
                color={ComponentColor.Primary}
                size={ComponentSize.Small}
                onClick={appearOverlay}
                text="Request Write Limit Increase"
              />
            )
          )
        )
      }
    }
  }, [showUpgrade, status])
  const rateLimitAlertClass = classnames('rate-alert', {
    [`${className}`]: className,
  })

  if (CLOUD && status === 'exceeded' && resources.includes('cardinality')) {
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
          <RateLimitAlertContent />
        </BannerPanel>
      </FlexBox>
    )
  }

  if (CLOUD && !alertOnly) {
    return (
      <CloudUpgradeButton
        className="upgrade-payg--button__header"
        metric={() => {
          event('rate limit upgrade', {location})
        }}
      />
    )
  }

  return null
}

export default RateLimitAlert

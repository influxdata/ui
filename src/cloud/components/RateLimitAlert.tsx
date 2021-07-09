// Libraries
import React, {FC, useEffect} from 'react'
import {connect} from 'react-redux'
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

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {AppState} from 'src/types'
import {LimitStatus} from 'src/cloud/actions/limits'
import RateLimitAlertContent from 'src/cloud/components/RateLimitAlertContent'

import {notify} from 'src/shared/actions/notifications'
import {writeLimitReached} from 'src/shared/copy/notifications'

// Selectors
import {shouldShowUpgradeButton} from 'src/me/selectors'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {UpgradeContent} from 'src/cloud/components/RateLimitAlertContent'

import './RateLimitAlert.scss'

interface StateProps {
  resources: string[]
  status: LimitStatus
  showUpgrade: boolean
}

interface OwnProps {
  alertOnly?: boolean
  className?: string
  sendNotify: (_: any) => void
  handleShowOverlay: any
  handleDismissOverlay: any
}
type Props = StateProps & OwnProps

const RateLimitAlert: FC<Props> = ({
  status,
  alertOnly,
  className,
  resources,
  showUpgrade,
  sendNotify,
  handleShowOverlay,
  handleDismissOverlay,
}) => {
  const appearOverlay = () => {
    handleShowOverlay('write-limit', null, handleDismissOverlay)
  }

  useEffect(() => {
    if (
      CLOUD &&
      status === LimitStatus.EXCEEDED &&
      resources.includes('write')
    ) {
      if (showUpgrade) {
        sendNotify(
          writeLimitReached(
            '',
            <UpgradeContent
              type="write"
              link="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/optimize-writes/"
              className="flex-upgrade-content"
            />
          )
        )
      } else {
        sendNotify(
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
      }
    }
  }, [showUpgrade, status])
  const rateLimitAlertClass = classnames('rate-alert', {
    [`${className}`]: className,
  })

  if (
    CLOUD &&
    status === LimitStatus.EXCEEDED &&
    resources.includes('cardinality')
  ) {
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
    return <CloudUpgradeButton className="upgrade-payg--button__header" />
  }

  return null
}

const mstp = (state: AppState) => {
  const {
    cloud: {limits},
  } = state

  const resources = extractRateLimitResources(limits)
  const status = extractRateLimitStatus(limits)
  const showUpgrade = shouldShowUpgradeButton(state)
  return {
    status,
    resources,
    showUpgrade,
  }
}

const mdtp = {
  sendNotify: notify,
  handleShowOverlay: showOverlay,
  handleDismissOverlay: dismissOverlay,
}

export default connect(mstp, mdtp)(RateLimitAlert)

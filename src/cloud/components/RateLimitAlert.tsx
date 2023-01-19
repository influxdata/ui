// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'

// Components
import {
  AlignItems,
  BannerPanel,
  Button,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Gradients,
  IconFont,
  InfluxColors,
} from '@influxdata/clockface'

// Overlays
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'

// Utils
import {
  extractRateLimitResources,
  extractRateLimitStatus,
} from 'src/cloud/utils/limits'
import {event} from 'src/cloud/utils/reporting'

// Components
import {CardinalityLimitAlertContent} from 'src/cloud/components/CardinalityLimitAlertContent'
import {CloudUpgradeButton} from 'src/shared/components/CloudUpgradeButton'
import {UpgradeContent} from 'src/cloud/components/CardinalityLimitAlertContent'

// Constants
import {CLOUD} from 'src/shared/constants'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {writeLimitReached} from 'src/shared/copy/notifications'

// Selectors
import {
  shouldGetCredit250Experience,
  shouldShowUpgradeButton,
} from 'src/me/selectors'
import {isOrgIOx} from 'src/organizations/selectors'

// Styles
import './RateLimitAlert.scss'

interface Props {
  alertOnly?: boolean
  className?: string
  location?: string
}

const bannerStyle = {border: 'none', borderRadius: '6px'}

export const RateLimitAlert: FC<Props> = ({alertOnly, className, location}) => {
  const resources = useSelector(extractRateLimitResources)
  const status = useSelector(extractRateLimitStatus)
  const showUpgrade = useSelector(shouldShowUpgradeButton)
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)
  const orgIsIOx = useSelector(isOrgIOx)

  const dispatch = useDispatch()

  const appearOverlay = () => {
    dispatch(showOverlay('write-limit', null, () => dispatch(dismissOverlay)))
  }

  // notification for write limit reached
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
  }, [showUpgrade, status]) // eslint-disable-line react-hooks/exhaustive-deps

  const rateLimitAlertClass = classnames('rate-alert', {
    [`${className}`]: className,
  })

  // banner panel for cardinality limit exceeded
  if (
    CLOUD &&
    !orgIsIOx &&
    status === 'exceeded' &&
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
          icon={IconFont.AlertTriangle}
          hideMobileIcon={true}
          textColor={InfluxColors.Yeti}
          style={bannerStyle}
        >
          <CardinalityLimitAlertContent />
        </BannerPanel>
      </FlexBox>
    )
  }

  // upgrade button
  if (CLOUD && !alertOnly) {
    return (
      <CloudUpgradeButton
        className="upgrade-payg--button__header"
        metric={() => {
          event(
            isCredit250ExperienceActive
              ? `${location}.alert.credit-250.upgrade`
              : `${location}.alert.upgrade`,
            {location}
          )
        }}
        size={ComponentSize.ExtraSmall}
      />
    )
  }

  return null
}

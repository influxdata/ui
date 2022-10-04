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
import {CloudUpgradeButton} from 'src/shared/components/CloudUpgradeButton'

// Utils
import {
  extractRateLimitResources,
  extractRateLimitStatus,
} from 'src/cloud/utils/limits'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getDataLayerIdentity,
  getExperimentVariantId,
} from 'src/cloud/utils/experiments'

// Constants
import {CLOUD} from 'src/shared/constants'
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

// Types
import RateLimitAlertContent from 'src/cloud/components/RateLimitAlertContent'

import {notify} from 'src/shared/actions/notifications'
import {writeLimitReached} from 'src/shared/copy/notifications'

// Selectors
import {
  shouldGetCredit250Experience,
  shouldShowUpgradeButton,
} from 'src/me/selectors'
import {dismissOverlay, showOverlay} from 'src/overlays/actions/overlays'
import {UpgradeContent} from 'src/cloud/components/RateLimitAlertContent'

import './RateLimitAlert.scss'

interface Props {
  alertOnly?: boolean
  className?: string
  location?: string
}

const bannerStyle = {border: 'none', borderRadius: '6px'}

const RateLimitAlert: FC<Props> = ({alertOnly, className, location}) => {
  const resources = useSelector(extractRateLimitResources)
  const status = useSelector(extractRateLimitStatus)
  const showUpgrade = useSelector(shouldShowUpgradeButton)
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

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

  const icon = isFlagEnabled('credit250Experiment')
    ? IconFont.AlertTriangle
    : IconFont.Cloud

  // banner panel for cardinality limit exceeded
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
          icon={icon}
          hideMobileIcon={true}
          textColor={InfluxColors.Yeti}
          style={bannerStyle}
        >
          <RateLimitAlertContent />
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
          const experimentVariantId = getExperimentVariantId(
            CREDIT_250_EXPERIMENT_ID
          )
          const identity = getDataLayerIdentity()
          event(
            isFlagEnabled('credit250Experiment') &&
              (experimentVariantId === '1' || isCredit250ExperienceActive)
              ? `${location}.alert.credit-250.upgrade`
              : `${location}.alert.upgrade`,
            {
              location,
              ...identity,
              experimentId: CREDIT_250_EXPERIMENT_ID,
              experimentVariantId: isCredit250ExperienceActive
                ? '2'
                : experimentVariantId,
            }
          )
        }}
        size={ComponentSize.ExtraSmall}
      />
    )
  }

  return null
}

export default RateLimitAlert

// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import classnames from 'classnames'

// Components
import {
  Button,
  FlexBox,
  ComponentSize,
  JustifyContent,
  ComponentColor,
} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {shouldShowUpgradeButton} from 'src/me/selectors'

// reporting
import {event} from 'src/cloud/utils/reporting'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'

// Constants
import {CREDIT_250_EXPERIMENT_ID} from 'src/shared/constants'

interface Props {
  className?: string
  location?: string
}

interface UpgradeProps {
  type: string
  link: string
  className?: string
  limitText?: string
  location?: string
}

interface UpgradeMessageProps {
  limitText: string
  link: string
  type: string
}

const UpgradeMessage: FC<UpgradeMessageProps> = ({limitText, link, type}) => {
  const original = (
    <span className="upgrade-message">
      Oh no! You hit the{' '}
      <SafeBlankLink href={link}>
        {type === 'series cardinality' ? 'series cardinality' : 'query write'}
      </SafeBlankLink>{' '}
      limit {limitText ?? ''} and your data stopped writing. Don't lose
      important metrics.
    </span>
  )

  if (isFlagEnabled('credit250Experiment')) {
    return (
      <GoogleOptimizeExperiment
        experimentID={CREDIT_250_EXPERIMENT_ID}
        original={original}
        variants={[
          <span className="upgrade-message" key="1">
            You hit the{' '}
            <SafeBlankLink href={link}>
              {type === 'series cardinality'
                ? 'series cardinality'
                : 'query write'}
            </SafeBlankLink>{' '}
            limit {limitText ?? ''} and your data stopped writing. Upgrade to
            get a free $250 credit for the first 30 days.
          </span>,
        ]}
      />
    )
  }
  return original
}

export const UpgradeContent: FC<UpgradeProps> = ({
  type,
  link,
  className,
  limitText,
  location,
}) => {
  return (
    <div className={`${className} rate-alert--content__free`}>
      <FlexBox
        justifyContent={JustifyContent.Center}
        className="rate-alert--button"
      >
        <UpgradeMessage {...{limitText, link, type}} />
        <CloudUpgradeButton
          className="upgrade-payg--button__rate-alert"
          showPromoMessage={false}
          metric={() => event(`user.limits.${type}.upgrade`, {location})}
        />
      </FlexBox>
    </div>
  )
}

const RateLimitAlertContent: FC<Props> = ({className, location}) => {
  const dispatch = useDispatch()
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const rateLimitAlertContentClass = classnames('rate-alert--content', {
    [`${className}`]: className,
  })

  const handleShowOverlay = () => {
    dispatch(showOverlay('rate-limit', null, () => dispatch(dismissOverlay)))
  }

  if (showUpgradeButton) {
    return (
      <UpgradeContent
        type="series cardinality"
        link="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/resolve-high-cardinality/"
        className={rateLimitAlertContentClass}
        location={location}
      />
    )
  }

  return (
    <div className={`${rateLimitAlertContentClass} rate-alert--content__payg`}>
      <span>
        Data in has stopped because you've hit the{' '}
        <SafeBlankLink href="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/resolve-high-cardinality/">
          series cardinality
        </SafeBlankLink>{' '}
        limit. Let's get it flowing again.
      </span>
      <FlexBox
        justifyContent={JustifyContent.Center}
        className="rate-alert--button"
      >
        <Button
          className="rate-alert-overlay-button"
          color={ComponentColor.Primary}
          size={ComponentSize.Small}
          onClick={handleShowOverlay}
          text="Inspect Series Cardinality"
        />
      </FlexBox>
    </div>
  )
}

export default RateLimitAlertContent

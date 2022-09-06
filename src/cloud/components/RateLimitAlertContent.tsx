// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import classnames from 'classnames'
import {
  Button,
  FlexBox,
  ComponentSize,
  JustifyContent,
  ComponentColor,
} from '@influxdata/clockface'

// Components
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Utils
import {
  shouldGetCredit250Experience,
  shouldShowUpgradeButton,
} from 'src/me/selectors'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getDataLayerIdentity,
  getExperimentVariantId,
} from 'src/cloud/utils/experiments'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

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
  isCredit250ExperienceActive: boolean
  limitText: string
  link: string
  type: string
}

const UpgradeMessage: FC<UpgradeMessageProps> = ({
  isCredit250ExperienceActive,
  limitText,
  link,
  type,
}) => {
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

  const credit250Experience = (
    <span className="upgrade-message" key="1">
      You hit the{' '}
      <SafeBlankLink href={link}>
        {type === 'series cardinality' ? 'series cardinality' : 'query write'}
      </SafeBlankLink>{' '}
      limit {limitText ?? ''} and your data stopped writing. Upgrade to get a
      free $250 credit for the first 30 days.
    </span>
  )

  if (isFlagEnabled('credit250Experiment')) {
    if (isCredit250ExperienceActive) {
      return credit250Experience
    }

    return (
      <GoogleOptimizeExperiment
        experimentID={CREDIT_250_EXPERIMENT_ID}
        original={original}
        variants={[credit250Experience]}
      />
    )
  }
  return original
}

export const UpgradeContent: FC<UpgradeProps> = ({
  className,
  limitText,
  link,
  location,
  type,
}) => {
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

  return (
    <div className={`${className} rate-alert--content__free`}>
      <FlexBox
        justifyContent={JustifyContent.SpaceBetween}
        className="rate-alert--button"
        stretchToFitWidth={true}
      >
        <UpgradeMessage
          {...{isCredit250ExperienceActive, limitText, link, type}}
        />
        <CloudUpgradeButton
          className="upgrade-payg--button__rate-alert"
          showPromoMessage={false}
          metric={() => {
            const experimentVariantId = getExperimentVariantId(
              CREDIT_250_EXPERIMENT_ID
            )
            const identity = getDataLayerIdentity()
            event(
              isFlagEnabled('credit250Experiment') &&
                (experimentVariantId === '1' || isCredit250ExperienceActive)
                ? `user.limits.${type}.credit-250.upgrade`
                : `user.limits.${type}.upgrade`,
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

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

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {shouldShowUpgradeButton} from 'src/me/selectors'

interface Props {
  className?: string
}

const RateLimitAlertContent: FC<Props> = ({className}) => {
  const dispatch = useDispatch()
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const rateLimitAlertContentClass = classnames('rate-alert--content', {
    [`${className}`]: className,
  })

  const handleShowOverlay = () => {
    dispatch(showOverlay('rate-limit', null, dispatch(dismissOverlay)))
  }

  if (showUpgradeButton) {
    return (
      <div
        className={`${rateLimitAlertContentClass} rate-alert--content__free`}
      >
        <span>
          Oh no! You hit the{' '}
          <a
            href="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/resolve-high-cardinality/"
            className="rate-alert--docs-link"
            target="_blank"
            rel="noreferrer"
          >
            series cardinality
          </a>{' '}
          limit and your data stopped writing. Don’t lose important metrics.
        </span>
        <FlexBox
          justifyContent={JustifyContent.Center}
          className="rate-alert--button"
        >
          <CloudUpgradeButton className="upgrade-payg--button__rate-alert" />
        </FlexBox>
      </div>
    )
  }

  return (
    <div className={`${rateLimitAlertContentClass} rate-alert--content__payg`}>
      <span>
        Data in has stopped because you've hit the{' '}
        <a
          href="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/resolve-high-cardinality/"
          className="rate-alert--docs-link"
          target="_blank"
          rel="noreferrer"
        >
          series cardinality
        </a>{' '}
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

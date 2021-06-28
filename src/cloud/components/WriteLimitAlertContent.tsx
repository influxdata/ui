import React, {FC, useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import classnames from 'classnames'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {shouldShowUpgradeButton} from 'src/me/selectors'

import {
  FlexBox,
  Button,
  ComponentColor,
  ComponentSize,
  JustifyContent,
} from '@influxdata/clockface'
import {UpgradeContent} from 'src/cloud/components/RateLimitAlertContent'

interface Props {
  className?: string
}
const WriteLimitAlertContent: FC<Props> = ({className}) => {
  const dispatch = useDispatch()
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)

  const rateLimitAlertContentClass = classnames('rate-alert--content', {
    [`${className}`]: className,
  })

  const handleShowOverlay = () => {
    dispatch(showOverlay('write-limit', null, dispatch(dismissOverlay)))
  }

  if (showUpgradeButton) {
    return (
      <UpgradeContent
        type="write"
        link="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/optimize-writes/"
        className={rateLimitAlertContentClass}
      />
    )
  }
  return (
    <div className={`${rateLimitAlertContentClass} rate-alert--content__payg`}>
      <span>
        Data in has stopped because you've hit the{' '}
        <a
          href="https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/optimize-writes/"
          className="rate-alert--docs-link"
          target="_blank"
          rel="noreferrer"
        >
          query write
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
          text="Request Write Limit Increase"
        />
      </FlexBox>
    </div>
  )
}

export default WriteLimitAlertContent

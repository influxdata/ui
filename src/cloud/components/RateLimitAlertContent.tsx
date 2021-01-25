// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {get, find} from 'lodash'
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

// Constants
import {
  HIDE_UPGRADE_CTA_KEY,
  PAID_ORG_HIDE_UPGRADE_SETTING,
} from 'src/cloud/constants'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Types
import {AppState, OrgSetting} from 'src/types'

interface OwnProps {
  className?: string
}

type ReduxProps = ConnectedProps<typeof connector>

const RateLimitAlertContent: FC<OwnProps & ReduxProps> = ({
  className,
  showUpgrade,
  onShowOverlay,
  onDismissOverlay,
}) => {
  const rateLimitAlertContentClass = classnames('rate-alert--content', {
    [`${className}`]: className,
  })

  const handleShowOverlay = () => {
    onShowOverlay('rate-limit', null, onDismissOverlay)
  }

  if (showUpgrade) {
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

const mstp = (state: AppState) => {
  const settings = get(state, 'cloud.orgSettings.settings', [])
  const hideUpgradeButtonSetting = find(
    settings,
    (setting: OrgSetting) => setting.key === HIDE_UPGRADE_CTA_KEY
  )
  if (
    !hideUpgradeButtonSetting ||
    hideUpgradeButtonSetting.value !== PAID_ORG_HIDE_UPGRADE_SETTING.value
  ) {
    return {showUpgrade: true}
  }
  return {showUpgrade: false}
}

const mdtp = {
  onShowOverlay: showOverlay,
  onDismissOverlay: dismissOverlay,
}

const connector = connect(mstp, mdtp)

export default connector(RateLimitAlertContent)

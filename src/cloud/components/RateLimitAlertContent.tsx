// Libraries
import React, {FC} from 'react'
import {connect} from 'react-redux'
import {get, find} from 'lodash'
import classnames from 'classnames'

// Components
import {
  FlexBox,
  JustifyContent,
  LinkButton,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

// Constants
import {
  HIDE_UPGRADE_CTA_KEY,
  PAID_ORG_HIDE_UPGRADE_SETTING,
} from 'src/cloud/constants'

// Types
import {AppState, OrgSetting} from 'src/types'

interface StateProps {
  showUpgrade: boolean
}

interface OwnProps {
  className?: string
}
type Props = StateProps & OwnProps

const RateLimitAlertContent: FC<Props> = ({showUpgrade, className}) => {
  const rateLimitAlertContentClass = classnames('rate-alert--content', {
    [`${className}`]: className,
  })

  if (showUpgrade) {
    return (
      <div
        className={`${rateLimitAlertContentClass} rate-alert--content__free`}
      >
        <span>
          Oh no! You hit the{' '}
          <a
            href="https://v2.docs.influxdata.com/v2.0/reference/glossary/#series-cardinality"
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
          href="https://v2.docs.influxdata.com/v2.0/reference/glossary/#series-cardinality"
          className="rate-alert--docs-link"
          target="_blank"
        >
          series cardinality
        </a>{' '}
        limit. Need some guidance?
      </span>
      <FlexBox
        justifyContent={JustifyContent.Center}
        className="rate-alert--button"
      >
        <LinkButton
          className="rate-alert--contact-button"
          color={ComponentColor.Primary}
          size={ComponentSize.Small}
          text="Speak with an Expert"
          href="https://calendly.com/c/CBCTLOTDNVLFUTZO"
          target="_blank"
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

export default connect<StateProps>(mstp)(RateLimitAlertContent)

// Libraries
import React, {FC} from 'react'
import {connect} from 'react-redux'
import {get, find} from 'lodash'
import classnames from 'classnames'

// Components
import {
  IconFont,
  LinkButton,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'

// Constants
import {CLOUD_URL, CLOUD_CHECKOUT_PATH} from 'src/shared/constants'
import {
  HIDE_UPGRADE_CTA_KEY,
  PAID_ORG_HIDE_UPGRADE_SETTING,
} from 'src/cloud/constants'

// Utils
import {getIsRegionBeta} from 'src/me/selectors'

// Types
import {AppState, OrgSetting} from 'src/types'

interface StateProps {
  inView: boolean
  isRegionBeta: boolean
}

interface OwnProps {
  className?: string
  buttonText?: string
  size?: ComponentSize
}

const CloudUpgradeButton: FC<StateProps & OwnProps> = ({
  inView,
  isRegionBeta,
  size = ComponentSize.Small,
  className,
  buttonText = 'Upgrade Now',
}) => {
  const cloudUpgradeButtonClass = classnames('upgrade-payg--button', {
    [`${className}`]: className,
  })

  // TODO(ariel): update the link to the local checkout if the flag is on
  return (
    <CloudOnly>
      {inView && !isRegionBeta && (
        <LinkButton
          icon={IconFont.CrownSolid}
          className={cloudUpgradeButtonClass}
          color={ComponentColor.Success}
          size={size}
          shape={ButtonShape.Default}
          href={`${CLOUD_URL}${CLOUD_CHECKOUT_PATH}`}
          target="_self"
          text={buttonText}
          testID="cloud-upgrade--button"
        />
      )}
    </CloudOnly>
  )
}

const mstp = (state: AppState) => {
  const settings = get(state, 'cloud.orgSettings.settings', [])
  const isRegionBeta = getIsRegionBeta(state)
  const hideUpgradeButtonSetting = find(
    settings,
    (setting: OrgSetting) => setting.key === HIDE_UPGRADE_CTA_KEY
  )
  let inView = false
  if (
    !hideUpgradeButtonSetting ||
    hideUpgradeButtonSetting.value !== PAID_ORG_HIDE_UPGRADE_SETTING.value
  ) {
    inView = true
  }
  return {inView, isRegionBeta}
}

export default connect<StateProps>(mstp)(CloudUpgradeButton)

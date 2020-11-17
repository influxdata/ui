// Libraries
import React, {FC, useEffect, useState} from 'react'
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

// Types
import {AppState, OrgSetting} from 'src/types'

// Utils
import {getExperimentVariantId} from 'src/cloud/utils/reporting'

interface StateProps {
  inView: boolean
}

interface OwnProps {
  className?: string
  buttonText?: string
  size?: ComponentSize
}

const CloudUpgradeButton: FC<StateProps & OwnProps> = ({
  inView,
  size = ComponentSize.Small,
  className,
  buttonText = 'Upgrade Now',
}) => {
  const cloudUpgradeButtonClass = classnames('upgrade-payg--button', {
    [`${className}`]: className,
  })

  const [iconVariant, setIconVariant] = useState<IconFont>(IconFont.Upgrade)

  useEffect(() => {
    const variantID = getExperimentVariantId('e44rY7GjQN-ASmGeWLs_pA')
    
    if (variantID) {
      setIconVariant([IconFont.Upgrade, IconFont.CrownSolid, IconFont.Star][variantID])
    }
  })

  return (
    <CloudOnly>
      {inView && (
        <LinkButton
          icon={iconVariant}
          className={cloudUpgradeButtonClass}
          color={ComponentColor.Success}
          size={size}
          shape={ButtonShape.Default}
          href={`${CLOUD_URL}${CLOUD_CHECKOUT_PATH}`}
          target="_self"
          text={buttonText}
        />
      )}
    </CloudOnly>
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
    return {inView: true}
  }
  return {inView: false}
}

export default connect<StateProps>(mstp)(CloudUpgradeButton)

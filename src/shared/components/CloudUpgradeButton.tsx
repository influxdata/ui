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
import {
  BETA_REGIONS,
  CLOUD_URL,
  CLOUD_CHECKOUT_PATH,
} from 'src/shared/constants'
import {
  HIDE_UPGRADE_CTA_KEY,
  PAID_ORG_HIDE_UPGRADE_SETTING,
} from 'src/cloud/constants'

// Types
import {AppState, OrgSetting} from 'src/types'

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

  // TODO(ariel): we need to build out an exception for beta regions
  // This current hack is being placed to allow a Beta region to be deployed
  // without allowing users to get navigated to a Quartz 404. This hack is being implemented
  // to address the following issue:
  // https://github.com/influxdata/ui/issues/944
  // The follow up to this issue will address the hack here:
  // https://github.com/influxdata/ui/issues/930

  const isBetaRegion = BETA_REGIONS.some((pathName: string) =>
    window.location.hostname.includes(pathName)
  )

  return (
    <CloudOnly>
      {inView && !isBetaRegion && (
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

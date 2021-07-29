// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

// Components
import {
  IconFont,
  Button,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'

// Constants
import {CLOUD_URL, CLOUD_CHECKOUT_PATH} from 'src/shared/constants'

// Utils
import {shouldShowUpgradeButton} from 'src/me/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface OwnProps {
  className?: string
  buttonText?: string
  size?: ComponentSize
  metric?: () => void
}

const CloudUpgradeButton: FC<OwnProps> = ({
  size = ComponentSize.Small,
  className,
  buttonText = 'Upgrade Now',
  metric,
}) => {
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)

  const cloudUpgradeButtonClass = classnames('upgrade-payg--button', {
    [`${className}`]: className,
  })

  const history = useHistory()

  const handleClick = () => {
    if (metric) {
      metric()
    }
    if (isFlagEnabled('unityCheckout') || isFlagEnabled('uiUnificationFlag')) {
      history.push('/checkout')
    } else {
      window.location.href = `${CLOUD_URL}${CLOUD_CHECKOUT_PATH}`
    }
  }

  return (
    <CloudOnly>
      {showUpgradeButton && (
        <Button
          icon={IconFont.CrownSolid}
          className={cloudUpgradeButtonClass}
          color={ComponentColor.Success}
          size={size}
          shape={ButtonShape.Default}
          onClick={handleClick}
          text={buttonText}
          testID="cloud-upgrade--button"
        />
      )}
    </CloudOnly>
  )
}

export default CloudUpgradeButton

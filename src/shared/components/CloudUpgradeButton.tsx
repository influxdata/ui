// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

// Components
import {
  IconFont,
  Button,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'

// Utils
import {shouldShowUpgradeButton} from 'src/me/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface OwnProps {
  buttonText?: string
  className?: string
  metric?: () => void
  showPromoMessage?: boolean
  size?: ComponentSize
}

const CloudUpgradeButton: FC<OwnProps> = ({
  buttonText = 'Upgrade Now',
  className,
  metric,
  showPromoMessage = true,
  size = ComponentSize.Small,
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
    history.push('/checkout')
  }

  const promoMessage =
    isFlagEnabled('credit250Experiment') && showPromoMessage ? (
      <span className="credit-250-experiment-upgrade-button--text">
        Get $250 free credit
      </span>
    ) : null

  return (
    <CloudOnly>
      {showUpgradeButton && (
        <span>
          {promoMessage}
          <Button
            icon={IconFont.CrownSolid_New}
            className={cloudUpgradeButtonClass}
            size={size}
            shape={ButtonShape.Default}
            onClick={handleClick}
            text={buttonText}
            testID="cloud-upgrade--button"
          />
        </span>
      )}
    </CloudOnly>
  )
}

export default CloudUpgradeButton

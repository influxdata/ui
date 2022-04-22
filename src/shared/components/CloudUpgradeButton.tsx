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
  hidePromoMessage?: boolean
  metric?: () => void
  size?: ComponentSize
}

const CloudUpgradeButton: FC<OwnProps> = ({
  buttonText = 'Upgrade Now',
  className,
  hidePromoMessage = false,
  metric,
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

  const credit250Message =
    isFlagEnabled('credit250Experiment') && !hidePromoMessage ? (
      <span className="credit-250-experiment-upgrade-button--text">
        Get $250 free credit
      </span>
    ) : null

  return (
    <CloudOnly>
      {showUpgradeButton && (
        <span>
          {credit250Message}
          <Button
            icon={IconFont.CrownSolid_New}
            className={cloudUpgradeButtonClass}
            size={size}
            shape={ButtonShape.Default}
            onClick={handleClick}
            text={buttonText}
            style={{
              background:
                'linear-gradient(45deg, rgb(52, 187, 85) 0%, rgb(0, 163, 255) 100%)',
            }}
            testID="cloud-upgrade--button"
          />
        </span>
      )}
    </CloudOnly>
  )
}

export default CloudUpgradeButton

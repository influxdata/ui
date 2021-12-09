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
    history.push('/checkout')
  }

  return (
    <CloudOnly>
      {showUpgradeButton && (
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
      )}
    </CloudOnly>
  )
}

export default CloudUpgradeButton

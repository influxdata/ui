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
import {
  shouldGetCredit250Experience,
  shouldShowUpgradeButton,
} from 'src/me/selectors'

interface OwnProps {
  buttonText?: string
  className?: string
  metric?: () => void
  showPromoMessage?: boolean
  size?: ComponentSize
}

export const CloudUpgradeButton: FC<OwnProps> = ({
  buttonText = 'Upgrade Now',
  className,
  metric,
  showPromoMessage = true,
  size = ComponentSize.Small,
}) => {
  const showUpgradeButton = useSelector(shouldShowUpgradeButton)
  const isCredit250ExperienceActive = useSelector(shouldGetCredit250Experience)

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

  const original = (
    <Button
      className={cloudUpgradeButtonClass}
      icon={IconFont.CrownSolid_New}
      onClick={handleClick}
      shape={ButtonShape.Default}
      size={size}
      testID="cloud-upgrade--button"
      text={buttonText}
    />
  )

  const credit250Experience = (
    <span key="1">
      <span className="credit-250-experiment-upgrade-button--text">
        Get $250 free credit
      </span>
      {original}
    </span>
  )

  if (showUpgradeButton) {
    if (showPromoMessage && isCredit250ExperienceActive) {
      return credit250Experience
    }
    return <CloudOnly>{original}</CloudOnly>
  }
  return null
}

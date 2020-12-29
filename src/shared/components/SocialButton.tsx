// Libraries
import React, {FC} from 'react'
import {ButtonBase, ButtonShape, ComponentSize} from '@influxdata/clockface'

interface Props {
  buttonText: string
  children: JSX.Element
  className?: string
  handleClick?: () => void
}

export const SocialButton: FC<Props> = ({
  buttonText,
  children,
  className,
  handleClick,
}) => {
  return (
    <ButtonBase
      onClick={handleClick}
      size={ComponentSize.Large}
      shape={ButtonShape.StretchToFit}
      className={className}
    >
      {children}
      <span className="signup-text">{buttonText}</span>
    </ButtonBase>
  )
}

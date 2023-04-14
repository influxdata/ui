// Libraries
import React, {FC} from 'react'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface OwnProps {
  href: string
  onClick: () => void
  title: string
}

export const OptionLink: FC<OwnProps> = ({href, onClick, title}) => {
  return (
    <SafeBlankLink href={href} onClick={onClick}>
      <div className="cf-button cf-button-xs cf-button-default">
        <span className="cf-button-label">{title}</span>
      </div>
    </SafeBlankLink>
  )
}

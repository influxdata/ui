import React, {FC} from 'react'

// Componnents
import {
  FlexBox,
  QuestionMarkTooltip,
  Icon,
  IconFont,
} from '@influxdata/clockface'

// Styles
import './Schema.scss'

interface TitleProps {
  label: string
  tooltipContents?: string | JSX.Element
  icon?: IconFont
}

const SelectorTitle: FC<TitleProps> = ({
  label,
  tooltipContents = '',
  icon = null,
}) => {
  return (
    <FlexBox className="selector-title">
      {icon && <Icon glyph={icon} className="selector-title--icon" />}
      <div>{label}</div>
      {tooltipContents && (
        <div className="selector-title--question-mark">
          <QuestionMarkTooltip
            tooltipContents={tooltipContents}
            diameter={14}
            tooltipStyle={{width: '300px'}}
          />
        </div>
      )}
    </FlexBox>
  )
}

export default SelectorTitle

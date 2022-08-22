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
  title: string
  info?: string // TODO: markdon? since there might be link
  icon?: IconFont
}

const SelectorTitle: FC<TitleProps> = ({title, info = '', icon = null}) => {
  return (
    <FlexBox className="selector-title">
      {icon && <Icon glyph={icon} className="selector-title--icon" />}
      <div>{title}</div>
      {info && (
        <div className="selector-title--question-mark">
          <QuestionMarkTooltip
            tooltipContents={info}
            diameter={14}
            tooltipStyle={{width: '300px'}}
          />
        </div>
      )}
    </FlexBox>
  )
}

export default SelectorTitle

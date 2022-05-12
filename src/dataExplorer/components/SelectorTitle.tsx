import React, {FC} from 'react'

// Componnents
import {IconFont, Icon, FlexBox} from '@influxdata/clockface'

// Styles
import './Schema.scss'

interface TitleProps {
  title: string
  info?: string // TODO: markdon? since there might be link
}

const SelectorTitle: FC<TitleProps> = ({title, info = ''}) => {
  return (
    <FlexBox className="selector-title">
      <div>{title}</div>
      {info && (
        <div className="selector-title--icon">
          <Icon glyph={IconFont.Info_New} />
          {info}
        </div>
      )}
    </FlexBox>
  )
}

export default SelectorTitle

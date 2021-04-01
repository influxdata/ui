// Libraries
import React, {FC} from 'react'

// Components
import {Icon, IconFont} from '@influxdata/clockface'

interface Props {
  id: string
  name: string
  description?: string
  color: string
}

export const AnnotationPill: FC<Props> = ({id, name, description, color}) => {
  return (
    <div className="annotation-pill" title={description}>
      <div
        className="annotation-pill--swatch"
        style={{backgroundColor: color}}
      />
      <div className="annotation-pill--label">{name}</div>
      <button
        className="annotation-pill--button"
        data-testid={`annotation-pill ${id}`}
      >
        <Icon glyph={IconFont.Remove} />
      </button>
    </div>
  )
}

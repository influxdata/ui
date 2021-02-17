// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'

// Actions
import {disableAnnotationStream} from 'src/annotations/actions/creators'

// Components
import {Icon, IconFont} from '@influxdata/clockface'

interface Props {
  id: string
  name: string
  description?: string
  color: string
}

export const AnnotationPill: FC<Props> = ({id, name, description, color}) => {
  const dispatch = useDispatch()

  const handleDisable = (): void => {
    dispatch(disableAnnotationStream(id))
  }

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
        onClick={handleDisable}
      >
        <Icon glyph={IconFont.Remove} />
      </button>
    </div>
  )
}

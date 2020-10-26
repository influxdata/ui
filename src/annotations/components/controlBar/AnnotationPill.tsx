// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'

// Actions
import {disableAnnotationStream} from 'src/annotations/actions'

// Components
import {Label, ComponentSize} from '@influxdata/clockface'

interface Props {
  id: string
  name: string
  description?: string
  color: string
}

const AnnotationPill: FC<Props> = ({id, name, description, color}) => {
  const dispatch = useDispatch()

  const handleDisable = (): void => {
    dispatch(disableAnnotationStream(id))
  }

  return (
    <Label
      name={name}
      color={color}
      id={id}
      onDelete={handleDisable}
      description={description}
      size={ComponentSize.ExtraSmall}
    />
  )
}

export default AnnotationPill

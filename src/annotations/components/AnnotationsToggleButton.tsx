// Libraries
import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Selectors
import {getAnnotationControlsVisibility} from 'src/annotations/selectors'

// Actions
import {toggleShowAnnotationsControls} from 'src/userSettings/actions'

// Components
import {Button, ComponentColor, IconFont} from '@influxdata/clockface'

export const AnnotationsToggleButton: FC = () => {
  const dispatch = useDispatch()
  const isVisible = useSelector(getAnnotationControlsVisibility)

  const buttonColor = isVisible
    ? ComponentColor.Secondary
    : ComponentColor.Default

  const titleText = isVisible
    ? 'Click to reveal annotations controls'
    : 'Click to hide annotations controls'

  const handleClick = (): void => {
    dispatch(toggleShowAnnotationsControls())
  }

  return (
    <Button
      text="Annotations"
      icon={IconFont.Annotate}
      color={buttonColor}
      titleText={titleText}
      testID="toggle-annoations-controls"
      onClick={handleClick}
    />
  )
}

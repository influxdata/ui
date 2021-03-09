// Libraries
import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Selectors
import {getAnnotationControlsVisibility} from 'src/annotations/selectors'

// Actions
import {toggleShowAnnotationsControls} from 'src/userSettings/actions'

// Components
import {Button, ComponentColor, IconFont} from '@influxdata/clockface'
import {event} from '../../cloud/utils/reporting'

export const AnnotationsToggleButton: FC = () => {
  const dispatch = useDispatch()
  const isVisible = useSelector(getAnnotationControlsVisibility)

  const buttonColor = isVisible
    ? ComponentColor.Secondary
    : ComponentColor.Default

  const titleText = isVisible
    ? 'Click to hide annotations controls'
    : 'Click to reveal annotations controls'

  const handleClick = (): void => {
    const newIsVisible = !isVisible
    event(
      'annotations control bar toggle button : onClick -> new toggle state : ',
      {},
      {writeMode: newIsVisible.toString()}
    )
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

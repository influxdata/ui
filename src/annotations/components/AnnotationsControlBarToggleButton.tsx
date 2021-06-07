// Libraries
import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Selectors
import {getAnnotationControlsVisibility} from 'src/annotations/selectors'

// Actions
import {toggleShowAnnotationsControls} from 'src/userSettings/actions'

// Components
import {Button, ComponentColor, IconFont} from '@influxdata/clockface'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const AnnotationsControlBarToggleButton: FC = () => {
  const dispatch = useDispatch()
  const isVisible = useSelector(getAnnotationControlsVisibility)

  const buttonColor = isVisible
    ? ComponentColor.Secondary
    : ComponentColor.Default

  const titleText = isVisible
    ? 'Annotations are on, Click here to turn Annotations off'
    : 'Annotations are off, Click here to turn Annotations on'

  const handleClick = (): void => {
    dispatch(toggleShowAnnotationsControls())

    event('dashboard.annotations.control_bar_toggle_button.toggle', {
      newIsControlBarVisible: (!isVisible).toString(),
    })
  }

  return (
    <Button
      text="Annotations"
      icon={IconFont.Annotate}
      color={buttonColor}
      titleText={titleText}
      testID="toggle-annotations-controls"
      onClick={handleClick}
    />
  )
}

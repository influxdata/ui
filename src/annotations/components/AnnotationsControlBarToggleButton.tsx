// Libraries
import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

// Actions
import {setAnnotationsMode} from 'src/annotations/actions/creators'

// Components
import {Button, ComponentColor, IconFont} from '@influxdata/clockface'

// Utils
import {event} from 'src/cloud/utils/reporting'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'

/**
 * This turns annotation on and off.
 * the control bar itself just shows messages at this point.
 * */
export const AnnotationsControlBarToggleButton: FC = () => {
  const dispatch = useDispatch()
  const inAnnotationsMode = useSelector(isAnnotationsModeEnabled)

  const buttonColor = inAnnotationsMode
    ? ComponentColor.Secondary
    : ComponentColor.Default

  const rangeText = isFlagEnabled('rangeAnnotations')
    ? ', Shift + Drag to annotate a range'
    : ''

  const titleText = inAnnotationsMode
    ? `Shift + Click to annotate a point${rangeText}. Click to turn Annotations off`
    : 'Click to turn Annotations on'

  const handleClick = (): void => {
    event('dashboard.annotations.change_mode.toggle', {
      newIsAnnotationsModeEnabled: (!inAnnotationsMode).toString(),
    })
    dispatch(setAnnotationsMode(!inAnnotationsMode))
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

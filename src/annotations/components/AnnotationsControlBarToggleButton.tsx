// Libraries
import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

// Actions
import {setAnnotationsMode} from 'src/annotations/actions/creators'

// Components
import {
  Appearance,
  InputLabel,
  InputToggleType,
  Toggle,
} from '@influxdata/clockface'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  className?: string
}
/**
 * This turns annotation on and off.
 * the control bar itself just shows messages at this point.
 * */
export const AnnotationsControlBarToggleButton: FC<Props> = ({className}) => {
  const dispatch = useDispatch()
  const inAnnotationsMode = useSelector(isAnnotationsModeEnabled)

  const titleText = inAnnotationsMode
    ? 'Shift + Click on a graph to annotate a point, Shift + Drag on a graph to annotate a range'
    : 'Click to turn Annotations on'

  const handleClick = (): void => {
    event('dashboard.annotations.change_mode.toggle', {
      newIsAnnotationsModeEnabled: (!inAnnotationsMode).toString(),
    })
    dispatch(setAnnotationsMode(!inAnnotationsMode))
  }

  return (
    <Toggle
      id="toggle-annotations-controls"
      type={InputToggleType.Checkbox}
      fill={Appearance.Solid}
      titleText={titleText}
      checked={inAnnotationsMode}
      testID="toggle-annotations-controls"
      onChange={handleClick}
      className={className}
    >
      <InputLabel
        htmlFor="toggle-annotations-controls"
        active={inAnnotationsMode}
        style={{fontWeight: 500}}
      >
        Enable Annotations
      </InputLabel>
    </Toggle>
  )
}

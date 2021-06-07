// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {
  ComponentColor,
  ComponentSize,
  FlexBoxChild,
  InfluxColors,
  InputLabel,
  InputToggleType,
  JustifyContent,
  TextBlock,
  Toggle,
} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import Toolbar from 'src/shared/components/toolbar/Toolbar'
import {setAnnotationsMode} from 'src/annotations/actions/creators'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const AnnotationsControlBar: FC = () => {
  const inAnnotationsMode = useSelector(isAnnotationsModeEnabled)

  const dispatch = useDispatch()

  const changeAnnotationsMode = () => {
    event('dashboard.annotations.change_mode.toggle', {
      newIsAnnotationsModeEnabled: (!inAnnotationsMode).toString(),
    })
    dispatch(setAnnotationsMode(!inAnnotationsMode))
  }

  const infoText1 =
    'Click on a graph to create a point annotation, click + shift + drag to create a range annotation.'

  const infoText2 =
    'Press the annotations button again to turn off annotation mode'

  // make both textblocks have 'inline' style to get them on the same line; else there is a line break.
  // using two elements to put space between them.
  return (
    <ErrorBoundary>
      <Toolbar
        testID="annotations-control-bar"
        justifyContent={JustifyContent.FlexEnd}
        margin={ComponentSize.Large}
      >
        <FlexBoxChild grow={0}>
          <TextBlock
            backgroundColor={InfluxColors.Obsidian}
            textColor={InfluxColors.Mist}
            text={infoText1}
            style={{display: 'inline'}}
          />
          <TextBlock
            backgroundColor={InfluxColors.Obsidian}
            textColor={InfluxColors.Mist}
            text={infoText2}
            style={{display: 'inline'}}
          />
        </FlexBoxChild>
        <FlexBoxChild grow={1} />
        <FlexBoxChild grow={0}>
          <Toggle
            style={{marginRight: 20}}
            id="enable-annotation-mode"
            type={InputToggleType.Checkbox}
            checked={inAnnotationsMode}
            onChange={changeAnnotationsMode}
            color={ComponentColor.Primary}
            size={ComponentSize.ExtraSmall}
            testID="annotations-write-mode-toggle"
          >
            <InputLabel htmlFor="enable-annotation-mode">
              Enable Annotations Mode
            </InputLabel>
          </Toggle>
        </FlexBoxChild>
      </Toolbar>
    </ErrorBoundary>
  )
}

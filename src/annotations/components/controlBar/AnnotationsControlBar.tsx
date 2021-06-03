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
import {
  setAnnotationsVisibility,
  setAnnotationsWriteMode,
} from 'src/annotations/actions/creators'

// Selectors
import {
  isWriteModeEnabled,
  selectAreAnnotationsVisible,
} from 'src/annotations/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const AnnotationsControlBar: FC = () => {
  const annotationsAreVisible = useSelector(selectAreAnnotationsVisible)
  const inWriteMode = useSelector(isWriteModeEnabled)

  const dispatch = useDispatch()

  const changeWriteMode = () => {
    event('dashboard.annotations.change_write_mode.toggle', {
      newIsWriteModeEnabled: (!inWriteMode).toString(),
    })
    dispatch(setAnnotationsWriteMode(!inWriteMode))
  }

  const changeAnnotationVisibility = () => {
    event('dashboard.annotations.change_visibility_mode.toggle', {
      newAnnotationsAreVisible: (!annotationsAreVisible).toString(),
    })
    dispatch(setAnnotationsVisibility(!annotationsAreVisible))
  }

  const infoText =
    'Click on a graph to create a point annotion, click + shift + drag to create a range annotation.' +
    'press the annotations button again to turn off annotation mode'

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
            text={infoText}
          />
        </FlexBoxChild>
        <FlexBoxChild grow={1} />
        <FlexBoxChild grow={0}>
          <Toggle
            style={{marginRight: 20}}
            id="enable-annotation-visibility"
            type={InputToggleType.Checkbox}
            checked={annotationsAreVisible}
            onChange={changeAnnotationVisibility}
            color={ComponentColor.Primary}
            size={ComponentSize.ExtraSmall}
            testID="annotations-visibility-toggle"
          >
            <InputLabel htmlFor="enable-annotation-visibility">
              Show Annotations
            </InputLabel>
          </Toggle>
        </FlexBoxChild>
        <FlexBoxChild grow={0}>
          <Toggle
            style={{marginRight: 20}}
            id="enable-annotation-mode"
            type={InputToggleType.Checkbox}
            checked={inWriteMode}
            onChange={changeWriteMode}
            color={ComponentColor.Primary}
            size={ComponentSize.ExtraSmall}
            testID="annotations-write-mode-toggle"
          >
            <InputLabel htmlFor="enable-annotation-mode">
              Enable Write Mode
            </InputLabel>
          </Toggle>
        </FlexBoxChild>
      </Toolbar>
    </ErrorBoundary>
  )
}

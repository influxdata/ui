// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexBoxChild,
  IconFont,
  InputLabel,
  InputToggleType,
  JustifyContent,
  SquareButton,
  Toggle,
} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import Toolbar from 'src/shared/components/toolbar/Toolbar'
import {
  toggleAnnotationVisibility,
  toggleSingleClickAnnotations,
} from 'src/annotations/actions/creators'
import {AnnotationPills} from 'src/annotations/components/controlBar/AnnotationPills'
import {AnnotationsSearchBar} from 'src/annotations/components/controlBar/AnnotationsSearchBar'

// Selectors
import {
  isSingleClickAnnotationsEnabled,
  selectAreAnnotationsVisible,
} from 'src/annotations/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const AnnotationsControlBar: FC = () => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string; dashboardID: string}>()

  const inWriteMode = useSelector(isSingleClickAnnotationsEnabled)
  const annotationsAreVisible = useSelector(selectAreAnnotationsVisible)

  const dispatch = useDispatch()

  const changeWriteMode = () => {
    event('dashboard.annotations.change_write_mode.toggle', {
      newIsWriteModeEnabled: (!inWriteMode).toString(),
    })
    dispatch(toggleSingleClickAnnotations())
  }

  const changeAnnotationVisibility = () => {
    event('dashboard.annotations.change_visibility_mode.toggle', {
      newAnnotationsAreVisible: (!annotationsAreVisible).toString(),
    })
    dispatch(toggleAnnotationVisibility())
  }

  return (
    <ErrorBoundary>
      <Toolbar
        testID="annotations-control-bar"
        justifyContent={JustifyContent.FlexEnd}
        margin={ComponentSize.Large}
      >
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
            testID="annotations-one-click-toggle"
          >
            <InputLabel htmlFor="enable-annotation-mode">
              Enable 1-Click Annotations
            </InputLabel>
          </Toggle>
        </FlexBoxChild>
      </Toolbar>
    </ErrorBoundary>
  )
}

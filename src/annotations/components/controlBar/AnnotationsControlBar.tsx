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
import {toggleSingleClickAnnotations} from 'src/annotations/actions/creators'
import {AnnotationPills} from 'src/annotations/components/controlBar/AnnotationPills'
import {AnnotationsSearchBar} from 'src/annotations/components/controlBar/AnnotationsSearchBar'

// Selectors
import {isSingleClickAnnotationsEnabled} from 'src/annotations/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const AnnotationsControlBar: FC = () => {
  const history = useHistory()
  const {orgID} = useParams<{orgID: string; dashboardID: string}>()

  const inWriteMode = useSelector(isSingleClickAnnotationsEnabled)

  const dispatch = useDispatch()

  const changeWriteMode = () => {
    event('dashboard.annotations.change_write_mode.toggle', {
      newIsWriteModeEnabled: (!inWriteMode).toString(),
    })
    dispatch(toggleSingleClickAnnotations())
  }

  return (
    <ErrorBoundary>
      <Toolbar
        testID="annotations-control-bar"
        justifyContent={JustifyContent.SpaceBetween}
        margin={ComponentSize.Large}
      >
        <FlexBoxChild basis={300} grow={0}>
          <AnnotationsSearchBar />
        </FlexBoxChild>
        <FlexBoxChild grow={1}>
          <AnnotationPills />
        </FlexBoxChild>
        <FlexBox margin={ComponentSize.Small}>
          <Toggle
            style={{marginRight: 20}}
            id="enableAnnotationMode"
            type={InputToggleType.Checkbox}
            checked={inWriteMode}
            onChange={changeWriteMode}
            color={ComponentColor.Primary}
            size={ComponentSize.ExtraSmall}
            testID="annotations-one-click-toggle"
          >
            <InputLabel htmlFor="enableAnnotationMode">
              Enable 1-Click Annotations
            </InputLabel>
          </Toggle>
        </FlexBox>
      </Toolbar>
    </ErrorBoundary>
  )
}

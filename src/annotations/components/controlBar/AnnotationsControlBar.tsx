// Libraries
import React, {useState, FC} from 'react'
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
import {
  getAnnotationControlsVisibility,
  isSingleClickAnnotationsEnabled,
} from 'src/annotations/selectors'

// Constants
import {ORGS, SETTINGS, ANNOTATIONS} from 'src/shared/constants/routes'

export const AnnotationsControlBar: FC = () => {
  const history = useHistory()
  const isVisible = useSelector(getAnnotationControlsVisibility)
  const {orgID} = useParams<{orgID: string; dashboardID: string}>()

  const [annotationWriteMode, setAnnotationWriteMode] = useState(
    useSelector(isSingleClickAnnotationsEnabled)
  )

  if (!isVisible) {
    return null
  }
  const dispatch = useDispatch()

  const onModeChange = () => {
    //todo:  call prop method to change the state
    dispatch(toggleSingleClickAnnotations())

    setAnnotationWriteMode(!annotationWriteMode)
  }

  const handleSettingsClick = (): void => {
    history.push(`/${ORGS}/${orgID}/${SETTINGS}/${ANNOTATIONS}`)
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
            checked={annotationWriteMode}
            onChange={onModeChange}
            color={ComponentColor.Primary}
            size={ComponentSize.ExtraSmall}
          >
            {' '}
            <InputLabel>Enable 1-Click Annotations</InputLabel>
          </Toggle>
          <SquareButton
            testID="annotations-control-bar--settings"
            icon={IconFont.CogThick}
            onClick={handleSettingsClick}
          />
        </FlexBox>
      </Toolbar>
    </ErrorBoundary>
  )
}

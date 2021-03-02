// Libraries
import React, {useState, FC} from 'react'
import {useSelector} from 'react-redux'
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
import {AnnotationPills} from 'src/annotations/components/controlBar/AnnotationPills'
import {AnnotationsSearchBar} from 'src/annotations/components/controlBar/AnnotationsSearchBar'

// Selectors
import {getAnnotationControlsVisibility} from 'src/annotations/selectors'

// Constants
import {ORGS, SETTINGS, ANNOTATIONS} from 'src/shared/constants/routes'

export const AnnotationsControlBar: FC = () => {
  const history = useHistory()
  const isVisible = useSelector(getAnnotationControlsVisibility)
  const {orgID} = useParams<{orgID: string; dashboardID: string}>()

  const [annotationWriteMode, setAnnotationWriteMode] = useState(false)

  if (!isVisible) {
    return null
  }

  const onModeChange = () => {
    //todo:  call prop method to change the state
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

// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {
  Button,
  SquareButton,
  IconFont,
  JustifyContent,
  FlexBox,
  FlexBoxChild,
  ComponentSize,
  ComponentColor,
} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import Toolbar from 'src/shared/components/toolbar/Toolbar'
import AnnotationPills from 'src/annotations/components/controlBar/AnnotationPills'
import AnnotationsSearchBar from 'src/annotations/components/controlBar/AnnotationsSearchBar'

// Selectors
import {getAnnotationControlsVisibility} from 'src/annotations/selectors'

// Constants
import {
  ORGS,
  SETTINGS,
  DASHBOARDS,
  ANNOTATIONS,
  DATA_EXPLORER,
} from 'src/shared/constants/routes'

const AnnotationsControlBar: FC = () => {
  const history = useHistory()
  const isVisible = useSelector(getAnnotationControlsVisibility)
  const {orgID, dashboardID} = useParams<{orgID: string; dashboardID: string}>()

  if (!isVisible) {
    return null
  }

  const handleSettingsClick = (): void => {
    history.push(`/${ORGS}/${orgID}/${SETTINGS}/${ANNOTATIONS}`)
  }

  const handleAnnotateClick = (): void => {
    // NOTE: these values should come from the interaction with the graph
    // You should get 2 timestamps and can infer type by comparing them
    const startTime = 'startTime'
    const stopTime = 'startTime'
    const type = startTime === stopTime ? 'point' : 'range'

    // Using presence of dashboardID to determine whether the user is viewing
    // a dashboard or the data explorer
    // This is brittle af

    // Query params are used here to pass some key information along
    // to the overlay without having to stick in it state for a brief moment

    const addAnnotationRoute = dashboardID
      ? `/${ORGS}/${orgID}/${DASHBOARDS}/${dashboardID}/add-annotation?type=${type}&startTime=${startTime}&stopTime=${stopTime}`
      : `/${ORGS}/${orgID}/${DATA_EXPLORER}/add-annotation?type=${type}&startTime=${startTime}&stopTime=${stopTime}`

    history.push(addAnnotationRoute)
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
          <Button
            testID="annotations-control-bar--add"
            text="Annotate"
            icon={IconFont.AnnotatePlus}
            color={ComponentColor.Primary}
            onClick={handleAnnotateClick}
          />
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

export default AnnotationsControlBar

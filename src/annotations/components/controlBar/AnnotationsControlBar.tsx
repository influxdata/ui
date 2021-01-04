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
import {AnnotationPills} from 'src/annotations/components/controlBar/AnnotationPills'
import {AnnotationsSearchBar} from 'src/annotations/components/controlBar/AnnotationsSearchBar'

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

export const AnnotationsControlBar: FC = () => {
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
    // You should get 2 timestamps
    const timeStart = 'today, right now'
    const timeStop = 'today, right now'

    // Using presence of dashboardID to determine whether the user is viewing
    // a dashboard or the data explorer
    // This is brittle af

    const addAnnotationRoute = dashboardID
      ? `/${ORGS}/${orgID}/${DASHBOARDS}/${dashboardID}/add-annotation`
      : `/${ORGS}/${orgID}/${DATA_EXPLORER}/add-annotation`

    // Using the second argument of history.push to pass some state along
    // to the overlay without having to expose it in the URL

    history.push(addAnnotationRoute, [{timeStart, timeStop}])
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

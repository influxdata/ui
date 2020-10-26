// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory, useRouteMatch} from 'react-router-dom'

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
import {ORGS, SETTINGS, DASHBOARDS} from 'src/shared/constants/routes'

interface DashboardRouteMatch {
  params: {
    orgID: string
    dashboardID: string
  }
}

const AnnotationsControlBar: FC = () => {
  const history = useHistory()
  const isVisible = useSelector(getAnnotationControlsVisibility)
  const match: DashboardRouteMatch = useRouteMatch({
    path: '/orgs/:orgID/dashboards/:dashboardID',
    strict: true,
  })

  if (!isVisible) {
    return null
  }

  const handleSettingsClick = (): void => {
    if (match?.params?.orgID) {
      history.push(`/${ORGS}/${match.params.orgID}/${SETTINGS}/annotations`)
    }
  }

  const handleAnnotateClick = (): void => {
    if (match?.params?.orgID && match?.params?.dashboardID) {
      history.push(
        `/${ORGS}/${match.params.orgID}/${DASHBOARDS}/${match.params.dashboardID}/add-annotation`
      )
    }
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

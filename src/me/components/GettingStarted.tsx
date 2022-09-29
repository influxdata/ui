// Libraries
import React, {FunctionComponent, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Panel,
  Button,
  InfluxColors,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'
import CollectorGraphic from 'src/me/graphics/CollectorGraphic'
import DashboardingGraphic from 'src/me/graphics/DashboardingGraphic'
import ExploreGraphic from 'src/me/graphics/ExploreGraphic'

// Selectors
import {getOrg} from 'src/organizations/selectors'

const GettingStarted: FunctionComponent = () => {
  const orgID = useSelector(getOrg).id
  const history = useHistory()
  const [loadDataAnimating, setLoadDataAnimation] = useState<boolean>(false)
  const handleLoadDataClick = (): void => {
    history.push(`/orgs/${orgID}/load-data/sources`)
  }
  const handleLoadDataMouseOver = (): void => {
    setLoadDataAnimation(true)
  }
  const handleLoadDataMouseOut = (): void => {
    setLoadDataAnimation(false)
  }

  const [dashboardingAnimating, setDashboardingAnimation] =
    useState<boolean>(false)
  const handleDashboardsClick = (): void => {
    history.push(`/orgs/${orgID}/dashboards`)
  }
  const handleDashboardsMouseOver = (): void => {
    setDashboardingAnimation(true)
  }
  const handleDashboardsMouseOut = (): void => {
    setDashboardingAnimation(false)
  }

  const [alertsAnimating, setAlertsAnimation] = useState<boolean>(false)
  const handleAlertsClick = (): void => {
    history.push(`/orgs/${orgID}/alerting`)
  }
  const handleAlertsMouseOver = (): void => {
    setAlertsAnimation(true)
  }
  const handleAlertsMouseOut = (): void => {
    setAlertsAnimation(false)
  }

  return (
    <div className="getting-started">
      <Panel
        className="getting-started--card"
        backgroundColor={InfluxColors.Grey25}
      >
        <div className="getting-started--card-digit">1</div>
        <Panel.Body>
          <CollectorGraphic animate={loadDataAnimating} />
        </Panel.Body>
        <Panel.Footer>
          <Button
            testID="getting-started--load-data--button"
            text="Load your data"
            color={ComponentColor.Primary}
            size={ComponentSize.Small}
            onClick={handleLoadDataClick}
            onMouseOver={handleLoadDataMouseOver}
            onMouseOut={handleLoadDataMouseOut}
          />
        </Panel.Footer>
      </Panel>
      <Panel
        className="getting-started--card"
        backgroundColor={InfluxColors.Grey25}
      >
        <div className="getting-started--card-digit">2</div>
        <Panel.Body>
          <DashboardingGraphic animate={dashboardingAnimating} />
        </Panel.Body>
        <Panel.Footer>
          <Button
            testID="getting-started--dashboards--button"
            text="Build a dashboard"
            color={ComponentColor.Primary}
            size={ComponentSize.Small}
            onClick={handleDashboardsClick}
            onMouseOver={handleDashboardsMouseOver}
            onMouseOut={handleDashboardsMouseOut}
          />
        </Panel.Footer>
      </Panel>
      <Panel
        className="getting-started--card"
        backgroundColor={InfluxColors.Grey25}
        style={{backgroundColor: '#333346'}}
      >
        <div className="getting-started--card-digit">3</div>
        <Panel.Body>
          <ExploreGraphic animate={alertsAnimating} />
        </Panel.Body>
        <Panel.Footer>
          <Button
            testID="getting-started--alerting--button"
            text="Set up alerting"
            color={ComponentColor.Primary}
            size={ComponentSize.Small}
            onClick={handleAlertsClick}
            onMouseOver={handleAlertsMouseOver}
            onMouseOut={handleAlertsMouseOut}
          />
        </Panel.Footer>
      </Panel>
    </div>
  )
}

export default GettingStarted

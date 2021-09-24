// Libraries
import React, {FunctionComponent, useState} from 'react'
import {Switch, Route, Link} from 'react-router-dom'

// Components
import {
  Page,
  SelectGroup,
  ButtonShape,
  Icon,
  IconFont,
} from '@influxdata/clockface'
import ChecksColumn from 'src/checks/components/ChecksColumn'
import RulesColumn from 'src/notifications/rules/components/RulesColumn'
import EndpointsColumn from 'src/notifications/endpoints/components/EndpointsColumn'
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import GetResources from 'src/resources/components/GetResources'
import EditCheckEO from 'src/checks/components/EditCheckEO'
import NewRuleOverlay from 'src/notifications/rules/components/NewRuleOverlay'
import EditRuleOverlay from 'src/notifications/rules/components/EditRuleOverlay'
import NewEndpointOverlay from 'src/notifications/endpoints/components/NewEndpointOverlay'
import EditEndpointOverlay from 'src/notifications/endpoints/components/EditEndpointOverlay'
import {
  ThresholdCheckOverlay,
  DeadmanCheckOverlay as NewDeadmanCheckEO,
} from 'src/overlays/components'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {ResourceType} from 'src/types'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import 'src/shared/components/cta.scss'

const alertsPath = '/orgs/:orgID/alerting'

type ActiveColumn = 'checks' | 'endpoints' | 'rules'

const AlertingIndex: FunctionComponent = () => {
  const [activeColumn, setActiveColumn] = useState<ActiveColumn>('checks')
  const [dismissFlowsCTA, setDismissFlowsCTA] = useState(false)

  const pageContentsClassName = `alerting-index alerting-index__${activeColumn}`

  const handleTabClick = (selectGroupOptionID: ActiveColumn): void => {
    setActiveColumn(selectGroupOptionID)
  }

  const hideFlowsCTA = () => {
    setDismissFlowsCTA(true)
  }

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Alerts'])}>
        <Page.Header fullWidth={true} testID="alerts-page--header">
          <Page.Title title="Alerts" />
          <ErrorBoundary>
            <RateLimitAlert />
          </ErrorBoundary>
        </Page.Header>
        <Page.Contents
          fullWidth={true}
          scrollable={false}
          className={pageContentsClassName}
        >
          {!dismissFlowsCTA && (
            <FeatureFlag name="flowsCTA">
              <div className="header-cta">
                <Icon glyph={IconFont.BookPencil} />
                Now you can use Notebooks to explore your data while building an
                alert
                <Link to="/notebook/from/notification">Create an Alert</Link>
                <span className="header-cta--close-icon" onClick={hideFlowsCTA}>
                  <Icon glyph={IconFont.Remove} />
                </span>
              </div>
            </FeatureFlag>
          )}
          <GetResources
            resources={[
              ResourceType.Labels,
              ResourceType.Buckets,
              ResourceType.Variables,
            ]}
          >
            <GetAssetLimits>
              <SelectGroup
                className="alerting-index--selector"
                shape={ButtonShape.StretchToFit}
              >
                <SelectGroup.Option
                  value="checks"
                  id="checks"
                  onClick={handleTabClick}
                  name="alerting-active-tab"
                  active={activeColumn === 'checks'}
                  testID="alerting-tab--checks"
                  tabIndex={1}
                >
                  Checks
                </SelectGroup.Option>
                <SelectGroup.Option
                  value="endpoints"
                  id="endpoints"
                  onClick={handleTabClick}
                  name="alerting-active-tab"
                  active={activeColumn === 'endpoints'}
                  testID="alerting-tab--endpoints"
                  tabIndex={2}
                >
                  Notification Endpoints
                </SelectGroup.Option>
                <SelectGroup.Option
                  value="rules"
                  id="rules"
                  onClick={handleTabClick}
                  name="alerting-active-tab"
                  active={activeColumn === 'rules'}
                  testID="alerting-tab--rules"
                  tabIndex={3}
                >
                  Notification Rules
                </SelectGroup.Option>
              </SelectGroup>
              <div className="alerting-index--columns">
                <GetResources resources={[ResourceType.Checks]}>
                  <ErrorBoundary>
                    <ChecksColumn tabIndex={1} />
                  </ErrorBoundary>
                </GetResources>
                <GetResources resources={[ResourceType.NotificationEndpoints]}>
                  <ErrorBoundary>
                    <EndpointsColumn tabIndex={2} />
                  </ErrorBoundary>
                </GetResources>
                <GetResources resources={[ResourceType.NotificationRules]}>
                  <ErrorBoundary>
                    <RulesColumn tabIndex={3} />
                  </ErrorBoundary>
                </GetResources>
              </div>
            </GetAssetLimits>
          </GetResources>
        </Page.Contents>
      </Page>
      <Switch>
        <Route
          path={`${alertsPath}/checks/new-threshold`}
          component={ThresholdCheckOverlay}
        />
        <Route
          path={`${alertsPath}/checks/new-deadman`}
          component={NewDeadmanCheckEO}
        />
        <Route
          path={`${alertsPath}/checks/:checkID/edit`}
          component={EditCheckEO}
        />
        <Route path={`${alertsPath}/rules/new`} component={NewRuleOverlay} />
        <Route
          path={`${alertsPath}/rules/:ruleID/edit`}
          component={EditRuleOverlay}
        />
        <Route
          path={`${alertsPath}/endpoints/new`}
          component={NewEndpointOverlay}
        />
        <Route
          path={`${alertsPath}/endpoints/:endpointID/edit`}
          component={EditEndpointOverlay}
        />
      </Switch>
    </>
  )
}

export default AlertingIndex

// Libraries
import React, {FC, useCallback, useContext} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import AutoRefreshDropdown from 'src/shared/components/dropdown_auto_refresh/AutoRefreshDropdown'
import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'
import DashboardLightModeToggle from 'src/dashboards/components/DashboardLightModeToggle'
import GraphTips from 'src/shared/components/graph_tips/GraphTips'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {
  Appearance,
  Button,
  ComponentColor,
  Dropdown,
  FlexBox,
  IconFont,
  InputLabel,
  InputToggleType,
  JustifyContent,
  Page,
  Toggle,
} from '@influxdata/clockface'
import {AnnotationsControlBarToggleButton} from 'src/annotations/components/AnnotationsControlBarToggleButton'

// Actions
import {toggleShowVariablesControls as toggleShowVariablesControlsAction} from 'src/userSettings/actions'
import {updateDashboard as updateDashboardAction} from 'src/dashboards/actions/thunks'
import {
  resetAutoRefresh as resetAutoRefreshAction,
  setAutoRefreshStatus as setAutoRefreshStatusAction,
} from 'src/shared/actions/autoRefresh'
import {
  setDashboardTimeRange as setDashboardTimeRangeAction,
  updateQueryParams as updateQueryParamsAction,
} from 'src/dashboards/actions/ranges'
import {
  dismissOverlay as dismissOverlayAction,
  showOverlay as showOverlayAction,
} from 'src/overlays/actions/overlays'

// Utils
import {resetQueryCache} from 'src/shared/apis/queryCache'
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
// Selectors
import {getTimeRange} from 'src/dashboards/selectors'
import {getByID} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

// Constants
import {
  DASHBOARD_NAME_MAX_LENGTH,
  DEFAULT_DASHBOARD_NAME,
} from 'src/dashboards/constants/index'

import './DashboardHeader.scss'

// Types
import {
  AppState,
  AutoRefresh,
  AutoRefreshStatus,
  Dashboard,
  ResourceType,
  TimeRange,
} from 'src/types'
import {AppSettingContext} from '../../shared/contexts/app'

interface OwnProps {
  autoRefresh: AutoRefresh
  onManualRefresh: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const DashboardHeader: FC<Props> = ({
  dashboard,
  onManualRefresh,
  toggleShowVariablesControls,
  showVariablesControls,
  onSetAutoRefreshStatus,
  timeRange,
  updateDashboard,
  updateQueryParams,
  setDashboardTimeRange,
  org,
  autoRefresh,
  resetAutoRefresh,
  showOverlay,
  dismissOverlay,
}) => {
  const history = useHistory()
  const handleAddNote = () => {
    history.push(`/orgs/${org.id}/dashboards/${dashboard.id}/notes/new`)
  }

  const handleAddCell = () => {
    if (isFlagEnabled('createWithDE')) {
      history.push(
        `/orgs/${org.id}/data-explorer/from/dashboard/${dashboard.id}/cell`
      )
      return
    }
    history.push(`/orgs/${org.id}/dashboards/${dashboard.id}/cells/new`)
  }

  const handleRenameDashboard = (name: string) => {
    updateDashboard(dashboard.id, {name})
    updatePinnedItemByParam(dashboard.id, {name})
  }

  const handleChooseTimeRange = (timeRange: TimeRange) => {
    resetQueryCache()
    setDashboardTimeRange(dashboard.id, timeRange)
    updateQueryParams({
      lower: timeRange.lower,
      upper: timeRange.upper,
    })

    if (timeRange.type === 'custom') {
      onSetAutoRefreshStatus(dashboard.id, AutoRefreshStatus.Disabled)
      return
    }

    if (autoRefresh?.status === AutoRefreshStatus.Disabled) {
      if (autoRefresh?.interval === 0) {
        onSetAutoRefreshStatus(dashboard.id, AutoRefreshStatus.Paused)
        return
      }

      onSetAutoRefreshStatus(dashboard.id, AutoRefreshStatus.Active)
    }
  }

  const resetCacheAndRefresh = useCallback((): void => {
    // We want to invalidate the existing cache when a user manually refreshes the dashboard
    resetQueryCache()
    onManualRefresh()
  }, [])

  const isActive =
    autoRefresh?.status && autoRefresh.status === AutoRefreshStatus.Active

  const {setPresentationMode, presentationMode} = useContext(AppSettingContext)

  return (
    <>
      <Page.Header fullWidth={true}>
        <RenamablePageTitle
          maxLength={DASHBOARD_NAME_MAX_LENGTH}
          onRename={handleRenameDashboard}
          name={dashboard && dashboard.name}
          placeholder={DEFAULT_DASHBOARD_NAME}
        />
      </Page.Header>
      <Page.ControlBar fullWidth={true}>
        <Page.ControlBarLeft>
          <Button
            icon={IconFont.AddCell_New}
            color={ComponentColor.Primary}
            onClick={handleAddCell}
            text="Add Cell"
            titleText="Add cell to dashboard"
          />
          <Button
            icon={IconFont.Text_New}
            text="Add Note"
            onClick={handleAddNote}
            testID="add-note--button"
          />
          <Toggle
            id="variables--button"
            type={InputToggleType.Checkbox}
            fill={Appearance.Solid}
            titleText="Variables"
            checked={showVariablesControls}
            testID="variables--button"
            onChange={toggleShowVariablesControls}
            className="control_buttons_collapsible"
          >
            <InputLabel
              htmlFor="variables--button"
              active={showVariablesControls}
              style={{fontWeight: 500}}
            >
              Show Variables
            </InputLabel>
          </Toggle>
          <AnnotationsControlBarToggleButton className="control_buttons_collapsible" />

          <Dropdown
            style={{width: '40px'}}
            button={(active, onClick) => (
              <Button
                icon={IconFont.More}
                onClick={onClick}
                active={active}
                testID="collapsible_menu"
              />
            )}
            menu={() => (
              <Dropdown.Menu style={{width: '200px'}}>
                <Toggle
                  id="variables--button"
                  type={InputToggleType.Checkbox}
                  fill={Appearance.Solid}
                  titleText="Variables"
                  checked={showVariablesControls}
                  testID="variables--button"
                  onChange={toggleShowVariablesControls}
                  style={{marginBottom: '8px'}}
                  className="control_buttons_in_collapsed_menu"
                >
                  <InputLabel
                    htmlFor="variables--button"
                    active={showVariablesControls}
                    style={{fontWeight: 500}}
                  >
                    Show Variables
                  </InputLabel>
                </Toggle>
                <AnnotationsControlBarToggleButton className="control_buttons_in_collapsed_menu" />
                <Toggle
                  id="toggle_presentation"
                  type={InputToggleType.Checkbox}
                  onChange={() => {
                    setPresentationMode(true)
                  }}
                  fill={Appearance.Solid}
                  style={{marginTop: '8px'}}
                  testID="presentation-mode-toggle"
                  checked={presentationMode}
                >
                  <InputLabel
                    active={presentationMode}
                    style={{fontWeight: 500}}
                    htmlFor="toggle_presentation"
                  >
                    Presentation Mode
                  </InputLabel>
                </Toggle>
                <FlexBox
                  justifyContent={JustifyContent.Center}
                  style={{marginTop: '8px'}}
                >
                  <DashboardLightModeToggle />
                </FlexBox>
              </Dropdown.Menu>
            )}
          />
          <GraphTips />
        </Page.ControlBarLeft>
        <Page.ControlBarRight>
          <AutoRefreshDropdown
            onChoose={() => {}}
            onManualRefresh={resetCacheAndRefresh}
            selected={autoRefresh}
            showAutoRefresh={false}
          />
          <Button
            text={
              isActive
                ? `Refreshing Every ${autoRefresh.label}`
                : 'Set Auto Refresh'
            }
            color={isActive ? ComponentColor.Secondary : ComponentColor.Default}
            onClick={
              isActive
                ? () => resetAutoRefresh(`dashboard-${dashboard.id}`)
                : () =>
                    showOverlay(
                      'toggle-auto-refresh',
                      {id: `dashboard-${dashboard.id}`},
                      () => dismissOverlay()
                    )
            }
            testID="enable-auto-refresh-button"
          />
          <TimeZoneDropdown />
          <TimeRangeDropdown
            onSetTimeRange={handleChooseTimeRange}
            timeRange={timeRange}
          />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

const mstp = (state: AppState) => {
  const {showVariablesControls} = state.userSettings
  const dashboard = getByID<Dashboard>(
    state,
    ResourceType.Dashboards,
    state.currentDashboard.id
  )

  const timeRange = getTimeRange(state)
  const org = getOrg(state)

  const autoRefresh =
    state.autoRefresh[`dashboard-${state.currentDashboard.id}`]

  return {
    org,
    dashboard,
    timeRange,
    showVariablesControls,
    autoRefresh,
  }
}

const mdtp = {
  toggleShowVariablesControls: toggleShowVariablesControlsAction,
  updateDashboard: updateDashboardAction,
  onSetAutoRefreshStatus: setAutoRefreshStatusAction,
  updateQueryParams: updateQueryParamsAction,
  setDashboardTimeRange: setDashboardTimeRangeAction,
  resetAutoRefresh: resetAutoRefreshAction,
  showOverlay: showOverlayAction,
  dismissOverlay: dismissOverlayAction,
}

const connector = connect(mstp, mdtp)

export default connector(DashboardHeader)

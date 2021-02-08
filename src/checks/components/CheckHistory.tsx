// Libraries
import React, {useMemo, FC} from 'react'
import {connect} from 'react-redux'

// Components
import {Page} from '@influxdata/clockface'
import EventViewer from 'src/eventViewer/components/EventViewer'
import CheckHistoryControls from 'src/checks/components/CheckHistoryControls'
import CheckHistoryVisualization from 'src/checks/components/CheckHistoryVisualization'
import AlertHistoryQueryParams from 'src/alerting/components/AlertHistoryQueryParams'
import EventTable from 'src/eventViewer/components/EventTable'
import GetResources from 'src/resources/components/GetResources'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import CheckProvider from 'src/checks/utils/context'

// Context
import {ResourceIDsContext} from 'src/alerting/components/AlertHistoryIndex'

// Constants
import {STATUS_FIELDS} from 'src/alerting/constants/history'

// Utils
import {loadStatuses, getInitialState} from 'src/alerting/utils/history'
import {getCheckIDs} from 'src/checks/selectors'
import {getTimeZone} from 'src/dashboards/selectors'

// Types
import {ResourceIDs} from 'src/checks/reducers'
import {AppState, TimeZone, ResourceType} from 'src/types'
import {RouteComponentProps} from 'react-router-dom'

interface StateProps {
  timeZone: TimeZone
  resourceIDs: ResourceIDs
}

type Props = RouteComponentProps<{orgID: string; checkID: string}> & StateProps

const CheckHistory: FC<Props> = ({match, timeZone, resourceIDs}) => {
  const loadRows = useMemo(
    () => options => loadStatuses(match.params.orgID, options),
    [match.params.orgID]
  )
  const historyType = 'statuses'
  const fields = STATUS_FIELDS
  return (
    <GetResources resources={[ResourceType.Checks]}>
      <ResourceIDsContext.Provider value={resourceIDs}>
        <EventViewer loadRows={loadRows} initialState={getInitialState()}>
          {props => (
            <Page
              titleTag="Check Statuses | InfluxDB 2.0"
              className="alert-history-page"
            >
              <Page.Header fullWidth={true}>
                <Page.Title
                  title="Check Statuses"
                  testID="alert-history-title"
                />
                <RateLimitAlert />
              </Page.Header>
              <Page.ControlBar fullWidth={true}>
                <Page.ControlBarLeft>
                  <CheckHistoryControls eventViewerProps={props} />
                  <AlertHistoryQueryParams
                    searchInput={props.state.searchInput}
                    historyType={historyType}
                  />
                </Page.ControlBarLeft>
              </Page.ControlBar>
              <Page.Contents
                fullWidth={true}
                scrollable={false}
                className="alert-history-page--contents"
              >
                <div className="alert-history-contents">
                  <CheckProvider id={match.params.checkID}>
                    <CheckHistoryVisualization timeZone={timeZone} />
                  </CheckProvider>
                  <div className="alert-history">
                    <EventTable {...props} fields={fields} />
                  </div>
                </div>
              </Page.Contents>
            </Page>
          )}
        </EventViewer>
      </ResourceIDsContext.Provider>
    </GetResources>
  )
}

const mstp = (state: AppState) => {
  const timeZone = getTimeZone(state)
  const checkIDs = getCheckIDs(state)

  const resourceIDs = {
    checkIDs,
    endpointIDs: null,
    ruleIDs: null,
  }

  return {timeZone, resourceIDs}
}

export default connect<StateProps>(mstp)(CheckHistory)

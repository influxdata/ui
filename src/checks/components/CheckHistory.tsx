// Libraries
import React, {useMemo, FC} from 'react'
import {useParams} from 'react-router'
import {useSelector} from 'react-redux'

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
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState, ResourceType} from 'src/types'

const CheckHistory: FC = () => {
  const resourceIDs = useSelector((state: AppState) => ({
    checkIDs: getCheckIDs(state),
    endpointIDs: null,
    ruleIDs: null,
  }))
  const org = useSelector(getOrg)
  const {checkID} = useParams()
  const loadRows = useMemo(() => options => loadStatuses(org.id, options), [
    org.id,
  ])
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
                  <CheckProvider id={checkID}>
                    <CheckHistoryVisualization />
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

export default CheckHistory

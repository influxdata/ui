// Libraries
import React, {useMemo, useState, FC, createContext} from 'react'
import {Page} from '@influxdata/clockface'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'

// Components
import EventViewer from 'src/eventViewer/components/EventViewer'
import EventTable from 'src/eventViewer/components/EventTable'
import AlertHistoryControls from 'src/alerting/components/AlertHistoryControls'
import AlertHistoryQueryParams from 'src/alerting/components/AlertHistoryQueryParams'
import GetResources from 'src/resources/components/GetResources'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

// Constants
import {
  STATUS_FIELDS,
  NOTIFICATION_FIELDS,
} from 'src/alerting/constants/history'

// Utils
import {
  loadStatuses,
  loadNotifications,
  getInitialHistoryType,
  getInitialState,
} from 'src/alerting/utils/history'
import {getCheckIDs} from 'src/checks/selectors'
import {getEndpointIDs} from 'src/notifications/endpoints/selectors'
import {getRuleIDs} from 'src/notifications/rules/selectors'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {ResourceIDs} from 'src/checks/reducers'
import {ResourceType, AlertHistoryType} from 'src/types'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'

export const ResourceIDsContext = createContext<ResourceIDs>(null)

const AlertHistoryIndex: FC = () => {
  const checkIDs = useSelector(getCheckIDs)
  const endpointIDs = useSelector(getEndpointIDs)
  const ruleIDs = useSelector(getRuleIDs)

  const resourceIDs = {
    checkIDs,
    endpointIDs,
    ruleIDs,
  }

  const {orgID} = useParams<{orgID: string}>()
  const [historyType, setHistoryType] = useState<AlertHistoryType>(
    getInitialHistoryType()
  )

  const loadRows = useMemo(() => {
    return historyType === 'statuses'
      ? options => loadStatuses(orgID, options)
      : options => loadNotifications(orgID, options)
  }, [orgID, historyType])

  const fields =
    historyType === 'statuses' ? STATUS_FIELDS : NOTIFICATION_FIELDS

  return (
    <GetResources
      resources={[
        ResourceType.Checks,
        ResourceType.NotificationEndpoints,
        ResourceType.NotificationRules,
      ]}
    >
      <ResourceIDsContext.Provider value={resourceIDs}>
        <EventViewer loadRows={loadRows} initialState={getInitialState()}>
          {props => (
            <Page
              titleTag={pageTitleSuffixer(['Check Statuses'])}
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
                <Page.ControlBarRight>
                  <AlertHistoryQueryParams
                    searchInput={props.state.searchInput}
                    historyType={historyType}
                  />
                  <AlertHistoryControls
                    historyType={historyType}
                    onSetHistoryType={setHistoryType}
                    eventViewerProps={props}
                  />
                  <TimeZoneDropdown />
                </Page.ControlBarRight>
              </Page.ControlBar>
              <Page.Contents
                fullWidth={true}
                scrollable={false}
                className="alert-history-page--contents"
              >
                <div className="alert-history">
                  <EventTable {...props} fields={fields} />
                </div>
              </Page.Contents>
            </Page>
          )}
        </EventViewer>
      </ResourceIDsContext.Provider>
    </GetResources>
  )
}

export default AlertHistoryIndex

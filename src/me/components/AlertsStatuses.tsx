// Libraries
import React, {FC, useMemo} from 'react'

// Components
import {Panel, Heading, HeadingElement, FontWeight} from '@influxdata/clockface'
import {
  runAlertsStatusesQuery,
  STATUSES_FIELDS,
} from 'src/alerting/utils/statuses'
import {connect} from 'react-redux'
import EventViewer from 'src/eventViewer/components/EventViewer'
import EventTable from 'src/eventViewer/components/EventTable'
import {ResourceType} from 'src/types'
import {ResourceIDsContext} from 'src/alerting/components/AlertHistoryIndex'
import {ResourceIDs} from 'src/checks/reducers'
import {RouteComponentProps, useParams} from 'react-router'
import GetResources from 'src/resources/components/GetResources'
import {getCheckIDs} from 'src/checks/selectors'
import {AppState} from 'src/types'

const fields = STATUSES_FIELDS

interface StateProps {
  resourceIDs: ResourceIDs
}

type Props = RouteComponentProps<{orgID: string}> & StateProps

const AlertsStatuses: FC<Omit<Props, 'history' | 'location' | 'match'>> = ({
  resourceIDs,
}) => {
  const {orgID} = useParams<{orgID: string}>()

  const loadRows = useMemo(
    () => options => runAlertsStatusesQuery(orgID, options),
    [orgID]
  )

  return (
    <GetResources resources={[ResourceType.Checks]}>
      <ResourceIDsContext.Provider value={resourceIDs}>
        <Panel>
          <Panel.Header>
            <Heading
              element={HeadingElement.H2}
              weight={FontWeight.Light}
              className="cf-heading__h4"
              testID="alerts-statuses"
            >
              Alerts Statuses
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <ul className="statuses-list">
              <EventViewer loadRows={loadRows} initialState={{}}>
                {props => (
                  <div className="alert-history-contents">
                    <div
                      className="alerts-statuses"
                      data-testid="alerts-statuses-table-container"
                    >
                      <EventTable {...props} fields={fields} />
                    </div>
                  </div>
                )}
              </EventViewer>
            </ul>
          </Panel.Body>
        </Panel>
      </ResourceIDsContext.Provider>
    </GetResources>
  )
}

const mstp = (state: AppState) => {
  const checkIDs = getCheckIDs(state)
  const endpointIDs = {}
  const ruleIDs = {}

  const resourceIDs = {
    checkIDs,
    endpointIDs,
    ruleIDs,
  }

  return {resourceIDs}
}

export default connect<StateProps>(mstp)(AlertsStatuses)

// Libraries
import React, {createContext, FC, useMemo} from 'react'

// Components
import {Panel, Heading, HeadingElement, FontWeight} from '@influxdata/clockface'
import {runAlertsActivityQuery} from 'src/alerting/utils/activity'
import {useSelector} from 'react-redux'
import EventViewer from 'src/eventViewer/components/EventViewer'
import EventTable from 'src/eventViewer/components/EventTable'
import {ResourceType} from 'src/types'
import GetResources from 'src/resources/components/GetResources'
import {getCheckIDs} from 'src/checks/selectors'
import {Fields} from 'src/eventViewer/types'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  fields: Fields
}

export const CheckIDsContext = createContext<{[x: string]: boolean}>(null)

const AlertsActivity: FC<Props> = ({fields}) => {
  const {id: orgID} = useSelector(getOrg)
  const checkIDs = useSelector(getCheckIDs)

  const loadRows = useMemo(
    () => options => runAlertsActivityQuery(orgID, options),
    [orgID]
  )

  return (
    <GetResources resources={[ResourceType.Checks]}>
      <CheckIDsContext.Provider value={checkIDs}>
        <Panel>
          <Panel.Header>
            <Heading
              element={HeadingElement.H2}
              weight={FontWeight.Light}
              className="cf-heading__h4"
              testID="alerts-activity"
            >
              Alerts Activity
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <ul className="statuses-list">
              <EventViewer loadRows={loadRows} initialState={{}}>
                {props => (
                  <div className="alert-activity-contents">
                    <div
                      className="alerts-activity"
                      data-testid="alerts-activity-table-container"
                    >
                      <EventTable {...props} fields={fields} />
                    </div>
                  </div>
                )}
              </EventViewer>
            </ul>
          </Panel.Body>
        </Panel>
      </CheckIDsContext.Provider>
    </GetResources>
  )
}

export default AlertsActivity

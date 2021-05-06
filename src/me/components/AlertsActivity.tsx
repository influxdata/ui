// Libraries
import React, {createContext, FC, useMemo} from 'react'

// Types
import {ResourceType} from 'src/types'
import {Fields} from 'src/types'

// Components
import {Panel, Heading, HeadingElement, FontWeight} from '@influxdata/clockface'
import {runAlertsActivityQuery} from 'src/alerting/utils/activity'
import {useSelector} from 'react-redux'
import EventViewer from 'src/eventViewer/components/EventViewer'
import EventTable from 'src/eventViewer/components/EventTable'
import GetResources from 'src/resources/components/GetResources'
import {getCheckIDs} from 'src/checks/selectors'
import {getOrg} from 'src/organizations/selectors'
import TimeTableField from 'src/alerting/components/TimeTableField'
import LevelTableField from 'src/alerting/components/LevelTableField'
import CheckActivityTableField from 'src/checks/components/CheckActivityTableField'

const STATUS_ACTIVITY_FIELDS: Fields = [
  {
    rowKey: 'time',
    columnName: 'time',
    columnWidth: 160,
    component: TimeTableField,
  },
  {
    rowKey: 'level',
    columnName: 'level',
    columnWidth: 50,
    component: LevelTableField,
  },
  {
    rowKey: 'checkID',
    columnName: 'ID',
    columnWidth: 150,
  },
  {
    rowKey: 'checkName',
    columnName: 'Check',
    columnWidth: 150,
    component: CheckActivityTableField,
  },
  {
    rowKey: 'checkMessage',
    columnName: 'Message',
    columnWidth: 300,
  },
]

export const CheckIDsContext = createContext<{[x: string]: boolean}>(null)

const AlertsActivity: FC = () => {
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
                      <EventTable {...props} fields={STATUS_ACTIVITY_FIELDS} />
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

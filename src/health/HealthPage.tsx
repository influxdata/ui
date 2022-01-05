// Libraries
import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {pageTitleSuffixer} from '../shared/utils/pageTitles'
import * as api from '../client'

// Components
import {Page} from '@influxdata/clockface'
import DashboardsHealth from './Dashboards/DashboardsHealth'
import {Dashboard as GenDashboard} from '../client'

// selectors
import {getOrg} from '../organizations/selectors'

const HealthPage = () => {
  const [dashboards, setDashboards] = useState([] as GenDashboard[])
  const [dashboardsLoaded, setDashboardsLoaded] = useState(false)

  const org = useSelector(getOrg)

  useEffect(() => {
    // get all dashboards
    api
      .getDashboards({
        query: {
          orgID: org.id,
        },
      })
      .then(result => {
        setDashboards(result.data['dashboards'] as GenDashboard[])
        setDashboardsLoaded(true)
      })
  }, [org.id])

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Health Page'])}>
        <Page.Header fullWidth={false} testID="health-check-page--header">
          <Page.Title title="Dashboards health" />
        </Page.Header>
        <Page.Contents scrollable={true}>
          {dashboardsLoaded ? (
            <DashboardsHealth dashboards={dashboards} />
          ) : null}
        </Page.Contents>
      </Page>
    </>
  )
}

export default HealthPage

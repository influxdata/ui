import React from 'react'

import {HealthDashboard} from 'src/types'
import DashboardHealth from './DashboardHealth'
import {Table} from '@influxdata/clockface'

type DashboardHealthProps = {
  dashboards: HealthDashboard[]
}

const DashboardsHealth = (props: DashboardHealthProps) => {
  const {dashboards} = props
  return (
    <>
      {dashboards
        .filter(dashboard => !dashboard.healthy)
        .map((dashboard, index) => (
          <div key={index}>
            <h4>{dashboard.name}</h4>
            <Table>
              <DashboardHealth dashboard={dashboard} key={index} />
            </Table>
          </div>
        ))}
    </>
  )
}

export default DashboardsHealth

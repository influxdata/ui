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
      <Table>
        {dashboards
          .filter(dashboard => !dashboard.healthy)
          .map((dashboard, index) => (
            <>
              <DashboardHealth dashboard={dashboard} key={index} />
            </>
          ))}
      </Table>
    </>
  )
}

export default DashboardsHealth

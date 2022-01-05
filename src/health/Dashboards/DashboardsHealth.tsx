import React from 'react'

import {Dashboard as GenDashboard} from 'src/client'
import DashboardHealth from './DashboardHealth'
import {Table} from '@influxdata/clockface'

type DashboardHealthProps = {
  dashboards: GenDashboard[]
}

const DashboardsHealth = (props: DashboardHealthProps) => {
  const {dashboards} = props

  return (
    <>
      <Table>
        {dashboards.map((dashboard, index) => (
          <DashboardHealth dashboard={dashboard} key={index} />
        ))}
      </Table>
    </>
  )
}

export default DashboardsHealth

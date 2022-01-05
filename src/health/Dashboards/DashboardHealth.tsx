import React from 'react'

import {HealthDashboard} from 'src/types'
import CellHealth from './CellHealth'
import {InfluxColors, Table} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {getOrg} from '../../organizations/selectors'

type DashboardHealthProps = {
  dashboard: HealthDashboard
}

const DashboardHealth = (props: DashboardHealthProps) => {
  const {dashboard} = props

  const history = useHistory()
  const org = useSelector(getOrg)

  const openDashboard = () => {
    history.push(`/orgs/${org.id}/dashboards/${dashboard.id}`)
  }
  return (
    <>
      <Table.Header>
        <h4 onClick={openDashboard} style={{cursor: 'pointer', color: InfluxColors.Pool, textDecorationLine:'underline'}}>{dashboard.name}</h4>
        <Table.Row>
          <Table.HeaderCell>Cells</Table.HeaderCell>
          <Table.HeaderCell>Bucket(s) Name</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {dashboard.cells
          .filter(cell => cell.missingBuckets.length > 0)
          .map((cell, index) => (
            <Table.Row key={index}>
              <CellHealth cell={cell} key={index} />
            </Table.Row>
          ))}
      </Table.Body>
    </>
  )
}

export default DashboardHealth

import React from 'react'

import {HealthNotebook} from 'src/types'
import FlowHealth from './FlowHealth'
import {InfluxColors, Table} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {getOrg} from '../../organizations/selectors'

type NotebookHealthProps = {
  notebook: HealthNotebook
}

const NotebookHealth = (props: NotebookHealthProps) => {
  const {notebook} = props

  const history = useHistory()
  const org = useSelector(getOrg)

  const openNotebook = () => {
    history.push(`/orgs/${org.id}/notebooks/${notebook.id}`)
  }
  return (
    <>
      <Table.Header>
        <h4
          onClick={openNotebook}
          style={{
            cursor: 'pointer',
            color: InfluxColors.Pool,
            textDecorationLine: 'underline',
          }}
        >
          {notebook.name}
        </h4>
        <Table.Row>
          <Table.HeaderCell>Flow</Table.HeaderCell>
          <Table.HeaderCell>Bucket(s) Name</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {notebook.flows
          .filter(flow => flow.missingBuckets.length > 0)
          .map((flow, index) => (
            <Table.Row key={index}>
              <FlowHealth flow={flow} key={index} />
            </Table.Row>
          ))}
      </Table.Body>
    </>
  )
}

export default NotebookHealth

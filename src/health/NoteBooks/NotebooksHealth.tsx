import React from 'react'

import {HealthNotebook} from 'src/types'
import {Table} from '@influxdata/clockface'
import NotebookHealth from './NotebookHealth'

type NotebooksHealthProps = {
  notebooks: HealthNotebook[]
}

const DashboardsHealth = (props: NotebooksHealthProps) => {
  const {notebooks} = props
  return (
    <>
      <Table>
        {notebooks
          .filter(notebook => !notebook.healthy)
          .map((notebook, index) => (
            <NotebookHealth notebook={notebook} key={index} />
          ))}
      </Table>
    </>
  )
}

export default DashboardsHealth

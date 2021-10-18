// Libraries
import React, {FC} from 'react'
import {Panel} from '@influxdata/clockface'

// Components

// Types

// Constants

const ZuoraOutagePanel: FC = () => {
  return (
    <Panel className="zuora-outage-panel">
      <Panel.Header>Sorry!</Panel.Header>
      <Panel.Body className="zuora-outage-panel-body">
        Our billing system is currently unavailable. Scheduled maintenance is
        undergoing.
        <br />
        <br />
        <div>
          Please try back later, and check our{' '}
          <a target="_blank" href="https://status.influxdata.com/">
            status page
          </a>{' '}
          for the latest updates.
        </div>
      </Panel.Body>
    </Panel>
  )
}

export default ZuoraOutagePanel

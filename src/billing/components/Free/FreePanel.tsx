import React, {FC} from 'react'
import {Panel} from '@influxdata/clockface'
import OrgLimits from 'src/billing/components/Free/OrgLimits'

const FreePanel: FC = () => {
  return (
    <Panel>
      <Panel.Header>
        <h4>Your Free Plan</h4>
      </Panel.Header>
      <Panel.Body>
        <OrgLimits />
      </Panel.Body>
    </Panel>
  )
}

export default FreePanel

import React, {FC} from 'react'
import {Panel} from '@influxdata/clockface'
import OrgLimits from './OrgLimits'
import {Limits} from 'src/types'

interface Props {
  orgLimits: Limits
}

const FreePanel: FC<Props> = ({orgLimits}) => {
  return (
    <Panel>
      <Panel.Header>
        <h4>Your Free Plan</h4>
      </Panel.Header>
      <Panel.Body>
        <OrgLimits orgLimits={orgLimits} />
      </Panel.Body>
    </Panel>
  )
}

export default FreePanel

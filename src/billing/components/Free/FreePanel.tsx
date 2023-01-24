import React, {FC} from 'react'
import {Panel} from '@influxdata/clockface'
import {OrgLimits} from 'src/billing/components/Free/OrgLimits'
import {Credit250PAYGConversion} from 'src/billing/components/Free/PAYGConversion'

export const FreePanel: FC = () => (
  <Panel>
    <Panel.Header>
      <h4>Your Free Plan</h4>
    </Panel.Header>
    <Panel.Body>
      <OrgLimits />
    </Panel.Body>
  </Panel>
)

export const Credit250FreePanel: FC = () => (
  <Panel>
    <Panel.Header>
      <h4>Your Free Plan</h4>
    </Panel.Header>
    <Panel.Body>
      <OrgLimits />
      <Credit250PAYGConversion />
    </Panel.Body>
  </Panel>
)

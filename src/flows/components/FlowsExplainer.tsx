// Libraries
import React, {FC} from 'react'

// Components
import {Panel, Gradients} from '@influxdata/clockface'
import {PROJECT_NAME_PLURAL} from 'src/flows'

const FlowsExplainer: FC = () => (
  <Panel gradient={Gradients.PolarExpress} border={true}>
    <Panel.Header>
      <h5>What is {PROJECT_NAME_PLURAL}?</h5>
    </Panel.Header>
    <Panel.Body>
      <p>
        {PROJECT_NAME_PLURAL} are a tool to help you explore, visualize, and
        process your data. Learn how to downsample data and other handy
        tutorials in the{' '}
        <a
          href="https://docs.influxdata.com/influxdb/cloud/notebooks/create-notebook/"
          target="_blank"
        >
          Documentation
        </a>
      </p>
    </Panel.Body>
  </Panel>
)

export default FlowsExplainer

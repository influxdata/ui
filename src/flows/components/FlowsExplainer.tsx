// Libraries
import React, {FC} from 'react'

// Components
import {Panel, Gradients} from '@influxdata/clockface'

const FlowsExplainer: FC = () => (
  <Panel gradient={Gradients.PolarExpress} border={true}>
    <Panel.Header>
      <h5>What is Flows?</h5>
    </Panel.Header>
    <Panel.Body>
      <p>
        Flows is a tool to help you explore, visualize, and process your data.
        Learn how to downsample data and other handy tutorials in the{' '}
        <a href="" target="_blank">
          Flows Documentation
        </a>
      </p>
    </Panel.Body>
  </Panel>
)

export default FlowsExplainer

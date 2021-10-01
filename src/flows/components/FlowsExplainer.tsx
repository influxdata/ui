// Libraries
import React, {FC} from 'react'

// Components
import {Panel, Gradients, AlignItems} from '@influxdata/clockface'
import {PROJECT_NAME_PLURAL, NOTEBOOKS_DOCUMENTATION_LINK} from 'src/flows'

const FlowsExplainer: FC = () => {
  return (
    <Panel gradient={Gradients.PolarExpress} border={true}>
      <Panel.Header>
        <h5>What are {PROJECT_NAME_PLURAL.toLowerCase()}?</h5>
      </Panel.Header>
      <Panel.Body alignItems={AlignItems.FlexStart}>
        <p>
          {PROJECT_NAME_PLURAL} are a tool to help you explore, visualize, and
          process your data.
          <br />
          Learn{' '}
          <a
            href={NOTEBOOKS_DOCUMENTATION_LINK}
            style={{margin: '30px 0px 10px 0px'}}
            target="_blank"
            rel="noreferrer"
          >
            how you can use notebooks
          </a>{' '}
          to downsample data or other handy tutorials.
        </p>
      </Panel.Body>
    </Panel>
  )
}

export default FlowsExplainer

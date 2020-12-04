// Libraries
import React, {FC} from 'react'

// Components
import {Panel, Gradients} from '@influxdata/clockface'

export const AnnotationsExplainer: FC = () => (
  <Panel gradient={Gradients.PolarExpress} border={true}>
    <Panel.Header>
      <h5>How to use Annotations</h5>
    </Panel.Header>
    <Panel.Body>
      <p>
        Annotations exist as regular time series data in any bucket you like.
        Annotation Streams contain a query to get a specific set of annotation
        data for easy display.
      </p>
      <p>
        Look for the <strong>Annotations</strong> button in dashboards and the
        Data Explorer.
      </p>
      <p>
        <a href="#" target="_blank">
          Annotations Documentation
        </a>
      </p>
    </Panel.Body>
  </Panel>
)

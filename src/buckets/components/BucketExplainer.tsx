// Libraries
import React, {FunctionComponent} from 'react'

// Components
import {Panel, Gradients} from '@influxdata/clockface'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

const BucketExplainer: FunctionComponent = () => (
  <Panel gradient={Gradients.PolarExpress} border={true}>
    <Panel.Header>
      <h5>What is a Bucket?</h5>
    </Panel.Header>
    <Panel.Body>
      <p>
        A bucket is a named location where time series data is stored. All
        buckets have a <b>Retention Policy</b>, a duration of time that each
        data point persists.
        <br />
        <br />
        Here's{' '}
        <a
          href={`https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/write-data/`}
          target="_blank"
          rel="noreferrer"
        >
          how to write data
        </a>{' '}
        into your bucket.
      </p>
    </Panel.Body>
  </Panel>
)

export default BucketExplainer

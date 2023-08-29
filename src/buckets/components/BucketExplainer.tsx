// Libraries
import React, {FunctionComponent} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Panel, Gradients} from '@influxdata/clockface'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

const BucketExplainer: FunctionComponent = () => {
  const docsLink = useSelector(isOrgIOx)
    ? 'https://docs.influxdata.com/influxdb/cloud-serverless/write-data/'
    : `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/write-data/`

  return (
    <Panel gradient={Gradients.PolarExpress} border={true}>
      <Panel.Header>
        <h5>What is a Bucket?</h5>
      </Panel.Header>
      <Panel.Body>
        <p>
          A bucket is a named location where time series data is stored. All
          buckets have a <b>Retention Period</b>, a duration of time that each
          data point persists.
          <br />
          <br />
          Here's{' '}
          <a href={docsLink} target="_blank" rel="noreferrer">
            how to write data
          </a>{' '}
          into your bucket.
        </p>
      </Panel.Body>
    </Panel>
  )
}

export default BucketExplainer

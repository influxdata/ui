// Libraries
import React, {FunctionComponent, CSSProperties} from 'react'
import {useSelector} from 'react-redux'

// Components
import {
  Panel,
  EmptyState,
  InfluxColors,
  Gradients,
  ComponentSize,
} from '@influxdata/clockface'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'

interface Props {
  hasNoTelegrafs?: boolean
  textAlign?: CSSProperties['textAlign']
  bodySize?: ComponentSize
}

const TelegrafExplainer: FunctionComponent<Props> = ({
  hasNoTelegrafs = false,
  textAlign = 'inherit',
  bodySize,
}) => {
  const docsUrl = useSelector(isOrgIOx)
    ? `https://docs.influxdata.com/influxdb/cloud-serverless/write-data/use-telegraf/`
    : `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/write-data/no-code/use-telegraf/`

  return (
    <Panel gradient={Gradients.PolarExpress} border={true} style={{textAlign}}>
      {hasNoTelegrafs && (
        <EmptyState.Text style={{color: InfluxColors.Grey85, marginTop: 16}}>
          What is Telegraf?
        </EmptyState.Text>
      )}
      {!hasNoTelegrafs && (
        <Panel.Header>
          <h5>What is Telegraf?</h5>
        </Panel.Header>
      )}
      <Panel.Body size={bodySize}>
        Telegraf is an agent written in Go for collecting metrics and writing
        them into <strong>InfluxDB</strong> or other possible outputs.
        <br />
        <br />
        Here's a handy guide for{' '}
        <a href={docsUrl} target="_blank" rel="noreferrer">
          Getting Started with Telegraf
        </a>
      </Panel.Body>
    </Panel>
  )
}

export default TelegrafExplainer

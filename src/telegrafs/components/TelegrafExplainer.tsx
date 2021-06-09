// Libraries
import React, {FunctionComponent, CSSProperties} from 'react'

// Components
import {
  Panel,
  EmptyState,
  InfluxColors,
  Gradients,
  ComponentSize,
} from '@influxdata/clockface'

interface Props {
  hasNoTelegrafs?: boolean
  textAlign?: CSSProperties['textAlign']
  bodySize?: ComponentSize
}

const TelegrafExplainer: FunctionComponent<Props> = ({
  hasNoTelegrafs = false,
  textAlign = 'inherit',
  bodySize,
}) => (
  <Panel gradient={Gradients.PolarExpress} border={true} style={{textAlign}}>
    {hasNoTelegrafs && (
      <EmptyState.Text style={{color: InfluxColors.Platinum, marginTop: 16}}>
        What is Telegraf?
      </EmptyState.Text>
    )}
    {!hasNoTelegrafs && (
      <Panel.Header>
        <h5>What is Telegraf?</h5>
      </Panel.Header>
    )}
    <Panel.Body size={bodySize}>
      Telegraf is an agent written in Go for collecting metrics and writing them
      into <strong>InfluxDB</strong> or other possible outputs.
      <br />
      <br />
      Here's a handy guide for{' '}
      <a
        href="https://docs.influxdata.com/influxdb/cloud/write-data/no-code/use-telegraf/"
        target="_blank"
        rel="noreferrer"
      >
        Getting Started with Telegraf
      </a>
    </Panel.Body>
  </Panel>
)

export default TelegrafExplainer

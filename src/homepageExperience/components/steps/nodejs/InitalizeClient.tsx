import React from 'react'
import {useSelector} from 'react-redux'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

import {getMe} from 'src/me/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.nodejsWizard.initializeClient.code.copied')
}

export const InitalizeClient = () => {
  const me = useSelector(getMe)

  const url =
    me.quartzMe?.clusterHost || 'https://us-west-2-1.aws.cloud2.influxdata.com/'

  const codeSnippet = `repl.repl.ignoreUndefined=true

const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const token = process.env.INFLUXDB_TOKEN
const url = '${url}'

const client = new InfluxDB({url, token})`

  return (
    <>
      <h1>Initialize Client</h1>
      <p>
        Run this command in your terminal to open the interactive Nodejs shell:
      </p>
      <CodeSnippet text="node" />
      <p style={{marginTop: '40px'}}>
        Paste the following code after the prompt (>) and press Enter.
      </p>
      <CodeSnippet text={codeSnippet} onCopy={logCopyCodeSnippet} />
      <p style={{marginTop: '42px'}}>
        Here, we initialize the token, organization info, and server url that is
        needed to set up the initial connection to InfluxDB. The client
        connection is then established with InfluxDBClient initialization.
      </p>
    </>
  )
}

import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.nodejsWizard.initializeClient.code.copied')
}

export const InitalizeClient = () => {
  const org = useSelector(getOrg)
  const me = useSelector(getMe)

  const url =
    me.quartzMe?.clusterHost || 'https://us-west-2-1.aws.cloud2.influxdata.com/'

  const codeSnippet = `const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const token = process.env.INFLUXDB_TOKEN
const url = '${url}'

const influxDBClient = new InfluxDB({url, token})`

  return (
    <>
      <h1>Initalize Client</h1>
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

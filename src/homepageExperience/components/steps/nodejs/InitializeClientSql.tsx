import React from 'react'
import {useSelector} from 'react-redux'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

import {selectCurrentIdentity} from 'src/identity/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.nodejsWizard.initializeClient.code.copied')
}

export const InitializeClientSql = () => {
  const {org} = useSelector(selectCurrentIdentity)

  const url = org.clusterHost || window.location.origin

  const codeSnippet = `import {InfluxDBClient, Point} from '@influxdata/influxdb3-client'

const token = process.env.INFLUXDB_TOKEN

async function main() {
    const client = new InfluxDBClient({host: '${url}', token: token})

    // following code goes here

    client.close()
}

main()`

  return (
    <>
      <h1>Initialize Client</h1>
      <p>Paste the following code to your project:</p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="javascript"
      />
      <p style={{marginTop: '42px'}}>
        Here, we initialize the token, organization info, and server url that
        are needed to set up the initial connection to InfluxDB. The client
        connection is then established with the{' '}
        <code className="homepage-wizard--code-highlight">InfluxDB</code>{' '}
        initialization.
      </p>
    </>
  )
}

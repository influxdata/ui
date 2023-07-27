import React from 'react'
import {useSelector} from 'react-redux'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

import {getOrg} from 'src/organizations/selectors'
import {selectCurrentIdentity} from 'src/identity/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.pythonWizard.initializeClient.code.copied')
}

export const InitializeClientSql = () => {
  const org = useSelector(getOrg)
  const {org: quartzOrg} = useSelector(selectCurrentIdentity)

  const url = quartzOrg.clusterHost || window.location.origin

  const pythonCode = `import os, time
from influxdb_client_3 import InfluxDBClient3, Point

token = os.environ.get("INFLUXDB_TOKEN")
org = "${org.name}"
host = "${url}"

client = InfluxDBClient3(host=host, token=token, org=org)`

  return (
    <>
      <h1>Initialize Client</h1>
      <p>
        Run this command in your terminal to open the interactive Python shell:
      </p>
      <CodeSnippet language="properties" text="python3" />
      <p>
        Paste the following code after the prompt (&gt;&gt;&gt;) and press
        Enter.
      </p>
      <CodeSnippet
        language="python"
        onCopy={logCopyCodeSnippet}
        text={pythonCode}
      />
      <p>
        Here, we initialize the token, organization info, and server url host
        that are needed to set up the initial connection to InfluxDB. The client
        connection is then established with the{' '}
        <code className="homepage-wizard--code-highlight">InfluxDBClient</code>{' '}
        initialization.
      </p>
    </>
  )
}

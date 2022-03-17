import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.pythonWizard.initializeClient.code.copied')
}

export const InitalizeClient = () => {
  const pythonCode = `import os
from datetime import datetime

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client import SYNCHRONOUS

token = os.environ.get("INFLUXDB_TOKEN")
org = "<user>@influxdata.com"
url = "https://us-west-2-1.aws.cloud2.influxdata.com/"

client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api(write_options=SYNCHRONOUS)`

  return (
    <>
      <h1>Initalize Client</h1>
      <p>
        Run this command in your terminal to open the interactive Python shell:
      </p>
      <CodeSnippet text="python3" />
      <p style={{marginTop: '40px'}}>
        Paste the following code after the prompt (>>>) and press Enter.
      </p>
      <CodeSnippet text={pythonCode} onCopy={logCopyCodeSnippet} />
      <p style={{marginTop: '42px'}}>
        Here, we initialize the token, organization info, and server url that is
        needed to set up the initial connection to InfluxDB. The client
        connection is then established with InfluxDBClient initialization.
      </p>
    </>
  )
}

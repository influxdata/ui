import React from 'react'
import {useSelector} from 'react-redux'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

import {getMe} from 'src/me/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.goWizard.initializeClient.code.copied')
}

export const InitializeClient = () => {
  const me = useSelector(getMe)

  const url =
    me.quartzMe?.clusterHost || 'https://us-west-2-1.aws.cloud2.influxdata.com/'

  const codeSnippet = `package main

import (
	"os"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
)

func main() {
	token := os.Getenv("INFLUXDB_TOKEN")
	url := "${url}"
	client := influxdb2.NewClient(url, token)
}`

  return (
    <>
      <h1>Initialize Client</h1>

      <p style={{marginTop: '40px'}}>
        Paste following code in your <code>main.go</code> file:
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="go"
      />
      <p style={{marginTop: '42px'}}>
        Here, we initialize the token, organization info, and server url that
        are needed to set up the initial connection to InfluxDB. The client
        connection is then established with the{' '}
        <code className="homepage-wizard--code-highlight">influxdb2</code>{' '}
        initialization.
      </p>
    </>
  )
}

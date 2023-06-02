import React from 'react'
import {useSelector} from 'react-redux'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'
import {selectCurrentIdentity} from 'src/identity/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.javaWizard.initializeClient.code.copied')
}

export const InitializeClient = () => {
  const {org: quartzOrg} = useSelector(selectCurrentIdentity)

  const url = quartzOrg.clusterHost || window.location.origin

  const javaCode = `package com.influxdb.v3;

import java.time.Instant;
import java.util.stream.Stream;

import com.influxdb.v3.client.InfluxDBClient;
import com.influxdb.v3.client.query.QueryParameters;
import com.influxdb.v3.client.write.Point;
import com.influxdb.v3.client.write.WriteParameters;

public final class IOxExample {

    public static void main(final String[] args) throws Exception {
        String hostUrl = "${url}";
        char[] authToken = System.getenv("INFLUXDB_TOKEN").toCharArray();

        try (InfluxDBClient client = InfluxDBClient.getInstance(hostUrl, authToken, null)) {

        }
    }
}
`

  return (
    <>
      <h1>Initialize Client</h1>
      <p>Paste the following code to your project:</p>
      <CodeSnippet
        language="java"
        onCopy={logCopyCodeSnippet}
        text={javaCode}
      />
      <p>
        Here, we initialize the token, organization info, and server url that
        are needed to set up the initial connection to InfluxDB. The client
        connection is then established with the{' '}
        <code className="homepage-wizard--code-highlight">InfluxDBClient</code>{' '}
        initialization.
      </p>
    </>
  )
}

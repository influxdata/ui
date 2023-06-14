import React from 'react'
import {useSelector} from 'react-redux'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'
import {selectCurrentIdentity} from 'src/identity/selectors'

export const InitializeClientSql = () => {
  const {org: quartzOrg} = useSelector(selectCurrentIdentity)

  const url = quartzOrg.clusterHost || window.location.origin

  const logCopyCodeSnippet = () => {
    event('firstMile.csharpWizard.initializeClient.code.copied')
  }

  const csharpCode = `using System;
using System.Threading;
using System.Threading.Tasks;
using InfluxDB3.Client;
using InfluxDB3.Client.Write;

namespace Examples
{
    public class WriteQueryExample
    {
        static async Task Main(string[] args)
        {
            var hostUrl = "${url}";
            var authToken = Environment.GetEnvironmentVariable("INFLUXDB_TOKEN");
            
            using var client = new InfluxDBClient(hostUrl, authToken: authToken);
        }
    }
}
`

  return (
    <>
      <h1>Initialize Client</h1>
      <p>Paste the following code to your project:</p>
      <CodeSnippet
        language="csharp"
        onCopy={logCopyCodeSnippet}
        text={csharpCode}
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

import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.executeQuery.code.copied')
}

export const ExecuteQuery = () => {
  const query = `influx query 'from(bucket:"sample-bucket") |> range(start:-10m)' --raw`

  const fluxExample = `from(bucket: “weather-data”)
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == “temperature”)`

  return (
    <>
      <h1>Execute a Flux Query</h1>
      <p>
        Now let's query the data we wrote into the database. We use the Flux
        scripting language to query data.{' '}
        <SafeBlankLink href="https://docs.influxdata.com/influxdb/v2.2/reference/syntax/flux/">
          Flux
        </SafeBlankLink>{' '}
        is designed for querying, analyzing, and acting on data.
        <br />
        <br />
        Here's an example of a basic Flux script:
      </p>
      <CodeSnippet
        text={fluxExample}
        showCopyControl={false}
        language="properties"
      ></CodeSnippet>
      <p style={{marginTop: '60px'}}>
        Let's write a Flux query in the InfluxCLI to read back all of the data
        you wrote in the previous step. Copy the code snippet below into the
        InfluxCLI.
      </p>
      <CodeSnippet
        text={query}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
    </>
  )
}

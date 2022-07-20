import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.executeAggregateQuery.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.cliWizard.executeAggregateQuery.docs.opened')
}

export const ExecuteAggregateQuery = () => {
  const fromBucketSnippet = `from(bucket: "weather-data")
  |> range(start: -10m)
  |> filter(fn: (r) => r.measurement == "temperature")
  |> mean()`

  const codeSnippet = `influx query 'from(bucket:"example-bucket") |> range(start:-10m) |> mean()' --raw`

  return (
    <>
      <h1>Execute a Flux Aggregate Query</h1>
      <p>
        An{' '}
        <SafeBlankLink
          href="https://docs.influxdata.com/flux/v0.x/function-types/#aggregates"
          onClick={logDocsOpened}
        >
          aggregate
        </SafeBlankLink>{' '}
        function is a powerful method for returning combined, summarized data
        about a set of time-series data.
      </p>
      <p>
        An aggregation is applied after the time range and filters, as seen in
        the example below.
      </p>
      <CodeSnippet
        text={fromBucketSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p>In the InfluxCLI, run the following:</p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p style={{marginTop: '20px'}}>
        This will return the mean of the insect counts from the census data.
      </p>
    </>
  )
}

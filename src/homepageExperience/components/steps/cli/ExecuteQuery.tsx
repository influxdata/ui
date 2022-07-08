import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuery = (props: OwnProps) => {
  const {bucket} = props

  const fromBucketSnippet = `from(bucket: “weather-data”)
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == “temperature”)`

  const query = `influx query 'from(bucket:"sample-bucket") |> range(start:-10m)' --raw`

  return (
    <>
      <h1>Execute a Flux Query</h1>
      <p>
        Now let's query the data we wrote into the database. We use the Flux
        scripting language to query data. <b>Flux</b> is designed for querying,
        analyzing, and acting on data.
        <br />
        <br />
        Here's an example of a basic Flux script:
      </p>
      <CodeSnippet
        text={fromBucketSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p>
        Let's write a Flux query in the InfluxCL to read back all of the data
        you wrote in the previous step. Copy the code snippet below into the
        InfluxCLI.
      </p>
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} language="go" />
    </>
  )
}

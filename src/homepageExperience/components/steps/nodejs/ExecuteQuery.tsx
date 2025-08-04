import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.nodejsWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuery = (props: OwnProps) => {
  const {bucket} = props

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m)`

  const query = `let queryClient = client.getQueryApi(org)
let fluxQuery = \`from(bucket: "${bucket}")
 |> range(start: -10m)
 |> filter(fn: (r) => r._measurement == "measurement1")\`

async function iterateRows() {
  for await (const {values, tableMeta} of queryClient.iterateRows(fluxQuery)) {
    const tableObject = tableMeta.toObject(values)
    console.log(tableObject)
  }
}
iterateRows()`

  return (
    <>
      <h1>Execute a Flux Query</h1>
      <p>
        Now let’s query the numbers we wrote into the database. We use the Flux
        scripting language to query data. Flux is designed for querying,
        analyzing, and acting on data.
        <br />
        <br />
        Here is what a simple Flux query looks like on its own:
      </p>
      <CodeSnippet
        text={fromBucketSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p>
        In this query, we are looking for data points within the last 10 minutes
        with a measurement of "measurement1".
        <br />
        <br />
        Let’s use that Flux query in our Nodejs code!
        <br />
        <br />
        Run the following:
      </p>
      <CodeSnippet
        text={query}
        onCopy={logCopyCodeSnippet}
        language="javascript"
      />
    </>
  )
}

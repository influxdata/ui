import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.goWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuery = (props: OwnProps) => {
  const {bucket} = props

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m)`

  const query = `queryAPI := client.QueryAPI(org)
query := \`from(bucket: "${bucket}")
            |> range(start: -10m)
            |> filter(fn: (r) => r._measurement == "measurement1")\`
results, err := queryAPI.Query(context.Background(), query)
if err != nil {
    log.Fatal(err)
}
for results.Next() {
    fmt.Println(results.Record())
}
if err := results.Err(); err != nil {
    log.Fatal(err)
}`

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
      />
      <p>
        In this query, we are looking for data points within the last 10 minutes
        with a measurement of "measurement1".
        <br />
        <br />
        Let’s use that Flux query in our Go code!
        <br />
        <br />
        Add the following to your <code>main</code> function:
      </p>
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} />
    </>
  )
}

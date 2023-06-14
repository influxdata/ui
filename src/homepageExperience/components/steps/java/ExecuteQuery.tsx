import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

type OwnProps = {
  bucket: string
}

export const ExecuteQuery = (props: OwnProps) => {
  const {bucket} = props

  const logCopyCodeSnippet = () => {
    event('firstMile.javaWizard.executeQuery.code.copied')
  }

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m)`

  const query = `QueryApi queryApi = client.getQueryApi();

String query = "from(bucket: \\"${bucket}\\")" +
        " |> range(start: -10m)";

for (FluxTable table : queryApi.query(query, org)) {
    List<FluxRecord> records = table.getRecords();
    for (FluxRecord record : records) {
        String field = record.getField();
        Object value = record.getValue();
        Instant time = record.getTime();

        System.out.printf("| %-5s | %-5s | %-30s |%n", field, value, time);
    }
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
        language="properties"
      />
      <p>
        In this query, we are looking for data points within the last 10 minutes
        with a measurement of "census".
        <br />
        <br />
        Let’s use that Flux query in our Java code!
        <br />
        <br />
        Add the following to your <code>WriteQueryExample</code> class:
      </p>
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} language="java" />
    </>
  )
}

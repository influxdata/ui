import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

type OwnProps = {
  bucket: string
}

export const ExecuteQuery = (props: OwnProps) => {
  const {bucket} = props

  const logCopyCodeSnippet = () => {
    event('firstMile.csharpWizard.executeQuery.code.copied')
  }

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m)`

  const query = `Console.WriteLine("Complete. Return to the InfluxDB UI.");

var queryApi = client.GetQueryApi();

const string query = @"from(bucket: ""${bucket}"") |> range(start: -10m)";

foreach (var table in await queryApi.QueryAsync(query: query, org: org))
{
    foreach (var record in table.Records)
    {
        var field = record.GetField();
        var value = record.GetValue();
        var time = record.GetTime();

        Console.WriteLine("| {0,-5} | {1,-5} | {2,-30} |", field, value, time);
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
        Let’s use that Flux query in our C# code!
        <br />
        <br />
        Add the following to your <code>WriteQueryExample</code> class:
      </p>
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} language="csharp" />
    </>
  )
}

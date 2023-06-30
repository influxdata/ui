import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'

type OwnProps = {
  bucket: string
}

export const ExecuteAggregateQuery = (props: OwnProps) => {
  const {bucket} = props

  const logCopyCodeSnippet = () => {
    event('firstMile.csharpWizard.executeAggregateQuery.code.copied')
  }

  const logDocsOpened = () => {
    event('firstMile.csharpWizard.executeAggregateQuery.docs.opened')
  }

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m) # find data points in last 10 minutes
  |> mean()`

  const query = `const string queryAggregate = @"from(bucket: ""${bucket}"")
    |> range(start: -10m)
    |> mean()";

foreach (var table in await queryApi.QueryAsync(query: queryAggregate, org: org))
{
    foreach (var record in table.Records)
    {
        var field = record.GetField();
        var value = record.GetValue();

        Console.WriteLine("| {0,-5} | {1,-20} |", field, value);
    }
}`

  return (
    <>
      <h1>Execute an Aggregate Query</h1>
      <p>
        <SafeBlankLink
          href="https://docs.influxdata.com/flux/v0.x/function-types/#aggregates"
          onClick={logDocsOpened}
        >
          Aggregate functions
        </SafeBlankLink>{' '}
        take the values of all rows in a table and use them to perform an
        aggregate operation. The result is output as a new value in a single-row
        table.
      </p>
      <CodeSnippet
        text={fromBucketSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p>
        In this example, we use the{' '}
        <code className="homepage-wizard--code-highlight">mean()</code> function
        to calculate the average value of data points in the last 10 minutes.
        <br />
        <br />
        Add the following to your <code>WriteQueryExample</code> class:
      </p>
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} language="csharp" />
      <p style={{marginTop: '20px'}}>
        This will return the mean for the "bees" and "ants" values.
      </p>
    </>
  )
}

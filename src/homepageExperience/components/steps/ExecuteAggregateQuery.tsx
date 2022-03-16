import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'

const fromBucketSnippet = `from(bucket: “my-bucket”)
  |> range(start: -10m) # find data points in last 10 minutes
  |> mean()`

const codeSnippet = `query_api = client.query_api()

query = "from(bucket: \\"bucket1\\") |> range(start: -10m) |> mean()"
tables = query_api.query(query, org=org)

for table in tables:
    for record in table.records:
        print(record)`

export const ExecuteAggregateQuery = () => {
  return (
    <>
      <h1>Execute an Aggregate Query</h1>
      <p>
        An{' '}
        <SafeBlankLink href="https://docs.influxdata.com/flux/v0.x/function-types/#aggregates">
          aggregate
        </SafeBlankLink>{' '}
        function is a powerful method for returning combined, summarized data
        about a set of time-series data.
      </p>
      <CodeSnippet text={fromBucketSnippet} showCopyControl={false} />
      <p>
        In this example, we use the mean() function to calculate the average of
        data points in last 10 minutes.
        <br />
        <br />
        Run the following:
      </p>
      <CodeSnippet text={codeSnippet} />
      <p style={{marginTop: '20px'}}>
        This will return the mean of the five values. ( (0+1+2+3+4) / 5 = 2 )
      </p>
    </>
  )
}

import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

const fromBucketSnippet = `from(bucket: “my-bucket”)
  |> range(start: -10m)`

const query = `query_api = client.query_api()

query = "from(bucket: \\"bucket1\\") |> range(start: -10m) |> mean()"
tables = query_api.query(query, org=org)

for table in tables:
    for record in table.records:
        print(record)`

export const ExecuteQuery = () => {
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
      <CodeSnippet text={fromBucketSnippet} showCopyControl={false} />
      <p>
        In this query, we are looking for data points within last 10 minutes
        with field key of “field1”.
        <br />
        <br />
        Let’s use that Flux query in our Python code!
        <br />
        <br />
        Run the following:
      </p>
      <CodeSnippet text={query} />
    </>
  )
}

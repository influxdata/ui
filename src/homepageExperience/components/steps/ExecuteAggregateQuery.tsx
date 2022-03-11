import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

export const ExecuteAggregateQuery = () => {
  const codeSnippet = `query_api = client.query_api()

query = "from(bucket: \\"bucket1\\") |> range(start: -10m) |> mean()"
tables = query_api.query(query, org=org)

for table in tables:
    for record in table.records:
        print(record)`
  return (
    <>
      <h1>Execute an Aggregate Query</h1>
      <p>Paste the following code after the prompt (>>>) and press Enter.</p>
      <CodeSnippet text={codeSnippet} />
      <p>This will return the mean of the five values. </p>
    </>
  )
}

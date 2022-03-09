import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

export const ExecuteQuery = () => {
  const query = `query_api = client.query_api()

query = "from(bucket: \\"bucket1\\") |> range(start: -10m) |> mean()"
tables = query_api.query(query, org=org)

for table in tables:
    for record in table.records:
        print(record)`

  return (
    <>
      <h1>Execute a Flux Query</h1>
      <p>
        Now let’s query the database for the data points we just wrote. We will
        use a short Flux query embedded in our Python. Paste the following code
        after the prompt (>>> ) and press Enter
      </p>
      <CodeSnippet text={query} />
    </>
  )
}

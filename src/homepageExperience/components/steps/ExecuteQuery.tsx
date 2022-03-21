import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

const fromBucketSnippet = `from(bucket: “my-bucket”)
  |> range(start: -10m)`

const logCopyCodeSnippet = () => {
  event('firstMile.pythonWizard.executeQuery.code.copied')
}

type ExecuteQueryProps = {
  bucket: string
}

export const ExecuteQuery = (props: ExecuteQueryProps) => {
  const org = useSelector(getOrg)
  const {bucket} = props
  const query = `query_api = client.query_api()

query = "from(bucket: \\"${bucket}\\") |> range(start: -10m) |> filter(fn: (r) => r._measurement == "measurement1")"
tables = query_api.query(query, org="${org.name}")

for table in tables:
    for record in table.records:
        print(record)`

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
        In this query, we are looking for data points within last 10 minutes
        with field key of “field1”.
        <br />
        <br />
        Let’s use that Flux query in our Python code!
        <br />
        <br />
        Run the following:
      </p>
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} />
    </>
  )
}

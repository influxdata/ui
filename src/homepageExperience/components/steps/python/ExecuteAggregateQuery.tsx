import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.pythonWizard.executeAggregateQuery.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.pythonWizard.executeAggregateQuery.docs.opened')
}

type OwnProps = {
  bucket: string
}

export const ExecuteAggregateQuery = (props: OwnProps) => {
  const org = useSelector(getOrg)
  const {bucket} = props

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m) # find data points in last 10 minutes
  |> mean()`

  const codeSnippet = `query_api = client.query_api()

query = """from(bucket: "${bucket}")
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == "measurement1")
  |> mean()"""
tables = query_api.query(query, org="${org.name}")

for table in tables:
    for record in table.records:
        print(record)
`

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
        Run the following:
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="python"
      />
      <p style={{marginTop: '20px'}}>
        This will return the mean of the five values. ( (0+1+2+3+4) / 5 = 2 )
      </p>
    </>
  )
}

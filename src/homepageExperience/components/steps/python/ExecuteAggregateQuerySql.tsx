import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.pythonWizard.executeAggregateQuery.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.pythonWizard.executeAggregateQuery.docs.opened')
}

type OwnProps = {
  bucket: string
}

export const ExecuteAggregateQuerySql = (props: OwnProps) => {
  const {bucket} = props

  const sqlSnippet = `SELECT mean(count)
FROM "census"
WHERE time > now() - 10m`

  const querySnippet = `query = """SELECT mean(count)
FROM "census"
WHERE time > now() - 10m"""

# Execute the query
table = client.query(query=query, database="${bucket}", language="influxql")

# Convert to dataframe
df = table.to_pandas().sort_values(by="time")
print(df)
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
        text={sqlSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="sql"
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
        text={querySnippet}
        onCopy={logCopyCodeSnippet}
        language="python"
      />
      <p>
        In this example we use{' '}
        <code className="homepage-wizard--code-highlight">InfluxQL</code> to
        perform our aggregation. SQL and InfluxQL can be used interchangeably in
        the Python client.
      </p>
    </>
  )
}

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
    event('firstMile.javaWizard.executeAggregateQuery.code.copied')
  }

  const logDocsOpened = () => {
    event('firstMile.javaWizard.executeAggregateQuery.docs.opened')
  }

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m) # find data points in last 10 minutes
  |> mean()`

  const query = `String queryAggregate = "from(bucket: \\"${bucket}\\")" +
                    " |> range(start: -10m)" +
                    " |> mean()";

for (FluxTable table : queryApi.query(queryAggregate, org)) {
    List<FluxRecord> records = table.getRecords();
    for (FluxRecord record : records) {
        String field = record.getField();
        Object value = record.getValue();

        System.out.printf("| %-5s | %-20s |%n", field, value);
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
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} language="java" />
      <p style={{marginTop: '20px'}}>
        This will return the mean for the "bees" and "ants" values.
      </p>
    </>
  )
}

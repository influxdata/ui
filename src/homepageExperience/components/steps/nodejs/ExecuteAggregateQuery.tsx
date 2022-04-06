import React from 'react'
import CodeSnippet from 'src/shared/components/CodeSnippet'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

const logCopyCodeSnippet = () => {
  event('firstMile.nodejsWizard.executeAggregateQuery.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.nodejsWizard.executeAggregateQuery.docs.opened')
}

type ExecuteAggregateQueryProps = {
  bucket: string
}

export const ExecuteAggregateQuery = (props: ExecuteAggregateQueryProps) => {
  const org = useSelector(getOrg)
  const {bucket} = props

  const fromBucketSnippet = `from(bucket: "${bucket}")
  |> range(start: -10m) # find data points in last 10 minutes
  |> mean()`

const query = `const queryClient = client.getQueryApi(org)
const fluxQuery = \`from(bucket: "fooo")
 |> range(start: -10m)
 |> filter(fn: (r) => r._measurement == "measurement1")
 |> mean()\`

queryClient.queryRows(fluxQuery, {
  next: (row, tableMeta) => {
    const tableObject = tableMeta.toObject(row)
    console.log(row, tableObject)
  },
  error: (error) => {
    console.error('\\nError', error)
  },
  complete: () => {
    console.log('\\nSuccess')
  },
})`

  return (
    <>
      <h1>Execute an Aggregate Query</h1>
      <p>
        An{' '}
        <SafeBlankLink
          href="https://docs.influxdata.com/flux/v0.x/function-types/#aggregates"
          onClick={logDocsOpened}
        >
          aggregate
        </SafeBlankLink>{' '}
        function is a powerful method for returning combined, summarized data
        about a set of time-series data.
      </p>
      <CodeSnippet
        text={fromBucketSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
      />
      <p>
        In this example, we use the mean() function to calculate the average of
        data points in last 10 minutes.
        <br />
        <br />
        Run the following:
      </p>
      <CodeSnippet text={query} onCopy={logCopyCodeSnippet} />
      <p style={{marginTop: '20px'}}>
        This will return the mean of the five values. ( (0+1+2+3+4) / 5 = 2 )
      </p>
    </>
  )
}

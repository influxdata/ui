// Libraries
import React, {useEffect} from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {DEFAULT_BUCKET} from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {event} from 'src/cloud/utils/reporting'
import {keyboardCopyTriggered, userSelection} from 'src/utils/crossPlatform'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.executeAggregateQuery.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.cliWizard.executeAggregateQuery.docs.opened')
}

type OwnProps = {
  bucket: string
}

export const ExecuteAggregateQuery = (props: OwnProps) => {
  const {bucket} = props
  const bucketName = bucket === DEFAULT_BUCKET ? 'sample-bucket' : bucket
  const fromBucketSnippet = `from(bucket: "weather-data")
  |> range(start: -10m)
  |> filter(fn: (r) => r.measurement == "temperature")
  |> mean()`

  const codeSnippetMac = `influx query 'from(bucket:"${bucketName}") |> range(start:-30m) |> mean()' --raw`
  const codeSnippetWindows = `.\\influx query 'from(bucket:"${bucketName}") |> range(start:-30m) |> mean()' --raw`

  useEffect(() => {
    const fireKeyboardCopyEvent = event => {
      if (
        keyboardCopyTriggered(event) &&
        userSelection().includes('influx query')
      ) {
        logCopyCodeSnippet()
      }
    }
    document.addEventListener('keydown', fireKeyboardCopyEvent)
    return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
  }, [])

  return (
    <>
      <h1>Execute a Flux Aggregate Query</h1>
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
      <p>
        An aggregation is applied after the time range and filters, as seen in
        the example below.
      </p>
      <CodeSnippet
        text={fromBucketSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p>In the InfluxDB CLI, run the following:</p>
      <CodeSnippet
        text={
          window?.navigator?.userAgent.includes('Mac')
            ? codeSnippetMac
            : codeSnippetWindows
        }
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p style={{marginTop: '20px'}}>
        This will return the mean of the sample data.
      </p>
    </>
  )
}

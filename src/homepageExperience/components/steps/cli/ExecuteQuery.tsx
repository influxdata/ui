// Libraries
import React, {useEffect} from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Constants
import {DEFAULT_BUCKET} from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {keyboardCopyTriggered, userSelection} from 'src/utils/crossPlatform'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuery = (props: OwnProps) => {
  const {bucket} = props
  const bucketName = bucket === DEFAULT_BUCKET ? 'sample-bucket' : bucket
  const query = `influx query 'from(bucket:"${bucketName}") |> range(start:-30m)' --raw`

  const fluxExample = `from(bucket: “weather-data”)
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == “temperature”)`

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
      <h1>Execute a Flux Query</h1>
      <p>
        Now let's query the data we wrote into the database. We use the Flux
        scripting language to query data.{' '}
        <SafeBlankLink href="https://docs.influxdata.com/influxdb/v2.2/reference/syntax/flux/">
          Flux
        </SafeBlankLink>{' '}
        is designed for querying, analyzing, and acting on data.
        <br />
        <br />
        Here's an example of a basic Flux script:
      </p>
      <CodeSnippet
        text={fluxExample}
        showCopyControl={false}
        language="properties"
      ></CodeSnippet>
      <p style={{marginTop: '60px'}}>
        Let's write a Flux query in the InfluxDB CLI to read back all of the
        data you wrote in the previous step. Copy the code snippet below into
        the InfluxDB CLI.
      </p>
      <CodeSnippet
        text={query}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
    </>
  )
}

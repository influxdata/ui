// Libraries
import React, {useEffect} from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Constants
import {DEFAULT_BUCKET} from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {
  isUsingWindows,
  keyboardCopyTriggered,
  userSelection,
} from 'src/utils/crossPlatform'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuerySql = (props: OwnProps) => {
  const {bucket} = props

  const bucketName = bucket === DEFAULT_BUCKET ? 'sample-bucket' : bucket

  const queryMacSql = `influx query "
import \\"experimental/iox\\"

iox.sql(
  bucket: \\"${bucketName}\\",
  query: \\"
    SELECT
      *
    FROM
      'airSensors'
    WHERE
      time >= now() - interval '30 minutes'
  \\",
)"`

  const queryWindowsSql = `.\\influx query
import \\"experimental/iox\\"

iox.sql(
  bucket: \\"${bucketName}\\",
  query: \\"
    SELECT
      *
    FROM
      'airSensors'
    WHERE
      time >= now() - interval '30 minutes'
  \\",
)"`

  const sqlExample = `SELECT
  *
FROM
  'airSensors'
WHERE
  time >= now() - interval '30 minutes'`

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
      <h1>Execute a SQL Query</h1>
      <p>
        Now let's query the data we wrote into the database. This is isolated
        SQL query:
      </p>
      <CodeSnippet
        text={sqlExample}
        showCopyControl={false}
        language="properties"
      ></CodeSnippet>
      <p style={{marginTop: '60px'}}>
        Let's write our SQL query in the InfluxDB CLI to read back all of the
        data you wrote in the previous step. Copy the code snippet below into
        the InfluxDB CLI.
      </p>
      <CodeSnippet
        text={isUsingWindows() ? queryWindowsSql : queryMacSql}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
    </>
  )
}

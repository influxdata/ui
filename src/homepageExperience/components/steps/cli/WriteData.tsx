// Libraries
import React, {useEffect, useState} from 'react'

// Components
import {
  Button,
  ButtonGroup,
  ComponentColor,
  InfluxColors,
  Panel,
} from '@influxdata/clockface'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import DataListening from 'src/homepageExperience/components/DataListening'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Constants
import {DEFAULT_BUCKET} from 'src/writeData/components/WriteDataDetailsContext'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {
  isUsingWindows,
  keyboardCopyTriggered,
  userSelection,
} from 'src/utils/crossPlatform'

// Assets
import sampleCsv from 'assets/images/sample-csv.png'

// Styles
import './CliSteps.scss'

// Types
type CurrentDataSelection = 'URL' | 'CSV'
type OwnProps = {
  bucket: string
}

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.writeData.code.copied')
}

export const WriteDataComponent = (props: OwnProps) => {
  const {bucket} = props
  const bucketName = bucket === DEFAULT_BUCKET ? 'sample-bucket' : bucket

  const sampleDataUrl =
    'https://influx-testdata.s3.amazonaws.com/air-sensor-data-annotated.csv'
  const writeDataCodeCsvMac = `influx write --bucket ${bucketName} --file downloads/air-sensor-data-annotated.csv`
  const writeDataCodeCsvWindows = `.\\influx write --bucket ${bucketName} --file <YOUR_PATH>/air-sensor-data-annotated.csv`
  const writeDataCodeUrlMac = `influx write --bucket ${bucketName} --url ${sampleDataUrl}`
  const writeDataCodeUrlWindows = `.\\influx write --bucket ${bucketName} --url ${sampleDataUrl}`

  const [currentDataSelection, setCurrentDataSelection] =
    useState<CurrentDataSelection>('URL')

  useEffect(() => {
    const fireKeyboardCopyEvent = event => {
      if (
        keyboardCopyTriggered(event) &&
        userSelection().includes('influx write --bucket')
      ) {
        logCopyCodeSnippet()
      }
    }
    document.addEventListener('keydown', fireKeyboardCopyEvent)
    return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
  }, [])

  return (
    <>
      <h1>Write Data</h1>
      <h2 style={{marginBottom: '8px'}}>Choose your sample data source</h2>
      <p className="small-margins">
        We recommend choosing an option that most closely matches how you will
        write your actual data.
      </p>
      <ButtonGroup className="small-margins">
        <Button
          text="URL to File"
          color={
            currentDataSelection === 'URL'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentDataSelection('URL')
          }}
        />
        <Button
          text="Local CSV"
          color={
            currentDataSelection === 'CSV'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentDataSelection('CSV')
          }}
        />
      </ButtonGroup>
      {currentDataSelection === 'CSV' && (
        <>
          <h2 className="large-margins">Download sample data</h2>
          <p className="small-margins">
            We'll use this data to guide you through writing data to a bucket,
            and then querying that data.
          </p>
          <p style={{marginTop: '0px', marginBottom: '16px'}}>
            Our sample CSV is air sensor data.
          </p>
          <SafeBlankLink href="https://influx-testdata.s3.amazonaws.com/air-sensor-data-annotated.csv">
            <Button text="Download Sample .CSV" />
          </SafeBlankLink>
          <p>
            The sample file is an Annotated CSV. The InfluxDB CLI supports both
            annotated and standard CSV formats.{' '}
            <SafeBlankLink href="https://docs.influxdata.com/influxdb/latest/reference/syntax/annotated-csv/">
              Annotated CSVs
            </SafeBlankLink>{' '}
            contain metadata about the data types in the file, which allows for
            faster write performance. To make this CSV unannotated, open the
            file in a text editor and remove the first 3 lines.
          </p>
          <h2 className="large-margins">Write Data</h2>
          <p className="small-margins">
            Copy the script below into your CLI, and update the path to the
            downloaded file. Then run the snippet to write the data to your
            bucket.
          </p>
          <CodeSnippet
            text={
              isUsingWindows() ? writeDataCodeCsvWindows : writeDataCodeCsvMac
            }
            onCopy={logCopyCodeSnippet}
            language="properties"
          />
          <p style={{marginTop: '8px', marginBottom: '8px'}}>
            Once the data is finished writing, you will see a confirmation
            below.
          </p>
          <Panel backgroundColor={InfluxColors.Grey15}>
            <Panel.Body>
              <DataListening bucket={bucketName} />
            </Panel.Body>
          </Panel>
          <h2>Review data concepts</h2>
          <p>
            <b>Field (required)</b> <br />
            Key-value pair for storing time-series data. For example, insect
            name and its count. You can have one field per record (row of data),
            and many fields per bucket. <br />
            <i>key data type: string</i> <br />
            <i>value data type: float, integer, string, or boolean</i>
            <br />
          </p>
          <p>
            <b>Measurement (required)</b> <br />
            A category for your fields. In our example, it is census. You can
            have one measurement per record (row of data), and many measurements
            per bucket. <br />
            <i>data type: string</i> <br />
          </p>
          <p style={{marginBottom: '48px'}}>
            <b>Tag (optional)</b> <br />
            Key-value pair for field metadata. For example, census location. You
            can have many tags per record (row of data) and per bucket.
            <br />
            <i>key data type: string</i> <br />
            <i>value data type: float, integer, string, or boolean</i>
          </p>
          <img
            style={{width: '100%', marginBottom: '48px'}}
            src={sampleCsv}
            alt="Sample CSV Screenshot"
          />
        </>
      )}
      {currentDataSelection === 'URL' && (
        <>
          <h2 className="large-margins">Review sample data</h2>
          <p className="small-margins">{sampleDataUrl}</p>
          <p>
            The sample file is an Annotated CSV. The InfluxDB CLI supports both
            annotated and standard CSV formats.{' '}
            <SafeBlankLink href="https://docs.influxdata.com/influxdb/latest/reference/syntax/annotated-csv/">
              Annotated CSVs
            </SafeBlankLink>{' '}
            contain metadata about the data types in the file, which allows for
            faster write performance.
          </p>
          <h2 className="large-margins">Write Data</h2>
          <p className="small-margins">
            Run the following code in the InfluxDB CLI to write the data to your
            bucket.
          </p>
          <CodeSnippet
            text={
              isUsingWindows() ? writeDataCodeUrlWindows : writeDataCodeUrlMac
            }
            onCopy={logCopyCodeSnippet}
            language="properties"
          />
          <p>
            Once the data is finished writing, you will see a confirmation
            below.
          </p>
          <Panel backgroundColor={InfluxColors.Grey15}>
            <Panel.Body>
              <DataListening bucket={bucketName} />
            </Panel.Body>
          </Panel>
          <h2>Review data concepts</h2>
          <p>
            <b>Field (required)</b> <br />
            Key-value pair for storing time-series data. For example, insect
            name and its count. You can have one field per record (row of data),
            and many fields per bucket. <br />
            <i>key data type: string</i> <br />
            <i>value data type: float, integer, string, or boolean</i>
            <br />
          </p>
          <p>
            <b>Measurement (required)</b> <br />
            A category for your fields. In our example, it is census. You can
            have one measurement per record (row of data), and many measurements
            per bucket. <br />
            <i>data type: string</i> <br />
          </p>
          <p>
            <b>Tag (optional)</b> <br />
            Key-value pair for field metadata. For example, census location. You
            can have many tags per record (row of data) and per bucket.
            <br />
            <i>key data type: string</i> <br />
            <i>value data type: float, integer, string, or boolean</i>
          </p>
        </>
      )}
    </>
  )
}

export const WriteData = props => {
  return <WriteDataComponent bucket={props.bucket} />
}

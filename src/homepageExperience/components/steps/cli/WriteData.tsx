// Libraries
import React, {useState} from 'react'

// Components
import {Button, ButtonGroup, ComponentColor} from '@influxdata/clockface'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {CsvGraphic} from 'src/homepageExperience/graphics/CsvGraphic'
import DataListening from 'src/homepageExperience/components/DataListening'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {downloadTextFile} from 'src/shared/utils/download'

// Assets
const csv = require('src/homepageExperience/assets/sample.csv')

// Styles
import './CliSteps.scss'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.writeData.code.copied')
}

const downloadCsvHandler = () => {
  downloadTextFile(csv.default, 'sample', '.csv')
}

type OwnProps = {
  bucket: string
}

export const WriteDataComponent = (props: OwnProps) => {
  const {bucket} = props
  const bucketName = bucket === '<BUCKET>' ? 'sample-bucket' : bucket

  const sampleDataUrl =
    'https://influx-testdata.s3.amazonaws.com/bird-migration.csv'
  const writeDataCodeCsv = `influx write --bucket ${bucketName} --file path/sample.csv`
  const writeDataCodeUrl = `influx write --bucket ${bucketName} --url ${sampleDataUrl}`

  const [urlSelected, setUrlSelected] = useState(true)
  const [csvSelected, setCsvSelected] = useState(false)

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
          color={urlSelected ? ComponentColor.Primary : ComponentColor.Default}
          onClick={() => {
            setUrlSelected(true)
            setCsvSelected(false)
          }}
        />
        <Button
          text="Local CSV"
          color={csvSelected ? ComponentColor.Primary : ComponentColor.Default}
          onClick={() => {
            setUrlSelected(false)
            setCsvSelected(true)
          }}
        />
      </ButtonGroup>
      {csvSelected && (
        <>
          <h2 className="large-margins">Download sample data</h2>
          <p className="small-margins">
            We'll use this data to guide you through writing data to a bucket,
            and then querying that data.
          </p>
          <p style={{marginTop: '0px', marginBottom: '16px'}}>
            Our sample CSV is earthquake data from the USGS.
          </p>
          <Button text="Download Sample .CSV" onClick={downloadCsvHandler} />
          <p>
            The sample file is an Annotated CSV. The InfluxCLI supports both
            annotated and standard CSV formats.{' '}
            <SafeBlankLink href="https://docs.influxdata.com/influxdb/v2.2/reference/syntax/annotated-csv/">
              Annotated CSVs
            </SafeBlankLink>{' '}
            contain metadata about the data types in the file, which allows for
            faster write performance.
          </p>
          <h2 className="large-margins">Write Data</h2>
          <p className="small-margins">
            Copy the script below into your CLI, and update the path to the
            downloaded file. Then run the snippet to write the data to your
            bucket.
          </p>
          <CodeSnippet
            text={writeDataCodeCsv}
            onCopy={logCopyCodeSnippet}
            language="properties"
          />
          <p style={{marginTop: '8px', marginBottom: '8px'}}>
            Once the data is finished writing, you will see a confirmation
            below.
          </p>
          <DataListening bucket={bucketName} />

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
          <CsvGraphic />
        </>
      )}
      {urlSelected && (
        <>
          <h2 className="large-margins">Review sample data</h2>
          <p className="small-margins">{sampleDataUrl}</p>
          <p>
            This file is an unannotated CSV. The InfluxCLI supports both
            annotated and standard CSV formats. Annotated CSVs contain metadata
            about the data types in the file, which allows for faster write
            performance.
          </p>
          <h2 className="large-margins">Write Data</h2>
          <p className="small-margins">
            Run the following code in the InfluxCLI to write the data to your
            bucket.
          </p>
          <CodeSnippet
            text={writeDataCodeUrl}
            onCopy={logCopyCodeSnippet}
            language="properties"
          />
          <p>
            Once the data is finished writing, you will see a confirmation
            below.
          </p>
          <DataListening bucket={bucketName} />
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

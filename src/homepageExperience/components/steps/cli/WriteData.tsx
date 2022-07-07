import React, {useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  ComponentColor,
  InfluxColors,
  ButtonGroup,
  Button,
} from '@influxdata/clockface'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

import {getOrg} from 'src/organizations/selectors'
import DataListening from 'src/homepageExperience/components/DataListening'
import {getBuckets} from 'src/buckets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.cliWizard.writeData.code.copied')
}

const writeDataCodeCsv = `influx write --bucket sample-bucket --file path/sample.csv`
const writeDataCodeUrl = `influx write --bucket sample-bucket --url https://<sample data url>`

const downloadCsvHandler = () => {
  window.location.href =
    'https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/'
}

type OwnProps = {
  onSelectBucket: (bucketName: string) => void
}

export const WriteDataComponent = (props: OwnProps) => {
  //const org = useSelector(getOrg)
  const dispatch = useDispatch()
  //const {onSelectBucket} = props

  useEffect(() => {
    dispatch(getBuckets())
  }, [])

  //const {bucket} = useContext(WriteDataDetailsContext)

  const [urlSelected, setUrlSelected] = useState(true)
  const [csvSelected, setCsvSelected] = useState(false)

  return (
    <>
      <h1>Write Data</h1>
      <h2 style={{marginBottom: '0px'}}>Choose your sample data source</h2>
      <p style={{marginTop: '8px', marginBottom: '0px'}}>
        We recommend choosing an option that most closely matches how you will
        write your actual data.
      </p>
      <ButtonGroup style={{marginTop: '8px', marginBottom: '0px'}}>
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
          <h2 style={{marginTop: '48px', marginBottom: '0px'}}>
            Download sample data
          </h2>
          <p style={{marginTop: '8px', marginBottom: '0px'}}>
            We'll use this data to guide you through writing data to a bucket,
            and then querying that data.
          </p>
          <p style={{marginTop: '8px', marginBottom: '16px'}}>
            Our sample data is a fictional bee and ant census.
          </p>
          <Button text="Download Sample .CSV" onClick={downloadCsvHandler} />
          <p>
            The sample file is an Annotated CSV. The InfluxCLI supports both
            annotated and standard CSV formats. Annotated CSVs contain metadata
            about the data types in the file, which allows for faster write
            performance.
          </p>
          <p>photo goes here</p>
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
          <h2 style={{marginTop: '48px', marginBottom: '0px'}}>Write Data</h2>
          <p style={{marginTop: '8px', marginBottom: '8px'}}>
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
          <DataListening bucket="sample-bucket" />
        </>
      )}
      {urlSelected && (
        <>
          <h2>Review sample data</h2>
          <SafeBlankLink href="#">URL GOES HERE</SafeBlankLink>
          <p>
            This file is an unannotated CSV. The InfluxCLI supports both
            annotated and standard CSV formats. Annotated CSVs contain metadata
            about the data types in the file, which allows for faster write
            performance.
          </p>
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
          <h2>Write Data</h2>
          <p>
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
          <DataListening bucket="sample-bucket" />
        </>
      )}
    </>
  )
}

export const WriteData = props => {
  return <WriteDataComponent onSelectBucket={props.onSelectBucket} />
}

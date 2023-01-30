import React, {useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Columns,
  ComponentSize,
  Grid,
  InfluxColors,
  Panel,
} from '@influxdata/clockface'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

import {getOrg} from 'src/organizations/selectors'
import DataListening from 'src/homepageExperience/components/DataListening'
import {getBuckets} from 'src/buckets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.pythonWizard.writeData.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.pythonWizard.writeData.docs.opened')
}

type OwnProps = {
  onSelectBucket: (bucketName: string) => void
}

export const WriteDataComponent = (props: OwnProps) => {
  const org = useSelector(getOrg)
  const dispatch = useDispatch()
  const {onSelectBucket} = props

  useEffect(() => {
    dispatch(getBuckets())
  }, [dispatch])

  const {bucket} = useContext(WriteDataDetailsContext)

  const [selectedBucket, setSelectedBucket] = useState(bucket)

  useEffect(() => {
    setSelectedBucket(bucket)
    onSelectBucket(bucket.name)
  }, [bucket, onSelectBucket])

  const codeSnippet = `bucket="${bucket.name}"

write_api = client.write_api(write_options=SYNCHRONOUS)
   
for value in range(5):
  point = (
    Point("measurement1")
    .tag("tagname1", "tagvalue1")
    .field("field1", value)
  )
  write_api.write(bucket=bucket, org="${org.name}", record=point)
  time.sleep(1) # separate points by 1 second
`

  return (
    <>
      <h1>Write Data</h1>
      <p>
        To start writing data, we need a place to store our time-series data. We
        call these{' '}
        <SafeBlankLink
          href={`orgs/${org.id}/load-data/buckets`}
          onClick={logDocsOpened}
        >
          buckets.
        </SafeBlankLink>
      </p>
      <p>Please select or create a new bucket:</p>

      <Panel backgroundColor={InfluxColors.Grey15}>
        <Panel.Body size={ComponentSize.ExtraSmall}>
          <Grid>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Twelve}>
                <WriteDataHelperBuckets useSimplifiedBucketForm={true} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Panel.Body>
      </Panel>
      <p>Run the following code in your Python shell:</p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="python"
      />
      <p>
        In the above code snippet, we define five data points and write each one
        to InfluxDB. Each of the 5 points we write has a{' '}
        <SafeBlankLink
          href="https://docs.influxdata.com/influxdb/latest/reference/glossary/#field-key"
          onClick={logDocsOpened}
        >
          field
        </SafeBlankLink>{' '}
        and a{' '}
        <SafeBlankLink
          href="https://docs.influxdata.com/influxdb/latest/reference/glossary/#tag-key"
          onClick={logDocsOpened}
        >
          tag
        </SafeBlankLink>
        .
      </p>
      <p>
        Once you write this data, you’ll begin to see the confirmation below
      </p>
      <Panel backgroundColor={InfluxColors.Grey15}>
        <Panel.Body>
          <DataListening bucket={selectedBucket.name} />
        </Panel.Body>
      </Panel>
    </>
  )
}

export const WriteData = props => {
  return <WriteDataComponent onSelectBucket={props.onSelectBucket} />
}

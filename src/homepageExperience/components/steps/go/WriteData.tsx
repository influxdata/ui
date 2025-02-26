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
  event('firstMile.goWizard.writeData.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.goWizard.writeData.docs.opened')
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

  const codeSnippet = `org := "${org.name}"
bucket := "${bucket.name}"
writeAPI := client.WriteAPIBlocking(org, bucket)
for value := 0; value < 5; value++ {
	tags := map[string]string{
		"tagname1": "tagvalue1",
	}
	fields := map[string]interface{}{
		"field1": value,
	}
	point := write.NewPoint("measurement1", tags, fields, time.Now())
	time.Sleep(1 * time.Second) // separate points by 1 second

	if err := writeAPI.WritePoint(context.Background(), point); err != nil {
		log.Fatal(err)
	}
}`

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
      <p>
        Add the following to your <code>main</code> function:
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="go"
      />
      <p style={{marginTop: '20px'}}>
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
      <p style={{marginTop: '40px'}}>
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

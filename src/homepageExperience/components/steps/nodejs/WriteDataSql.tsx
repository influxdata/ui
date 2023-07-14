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
  event('firstMile.nodejsWizard.writeData.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.nodejsWizard.writeData.docs.opened')
}

type OwnProps = {
  onSelectBucket: (bucketName: string) => void
}

export const WriteDataSqlComponent = (props: OwnProps) => {
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

  const codeSnippet = `let org = \`${org.name}\`
let bucket = \`${bucket.name}\`

let writeClient = client.getWriteApi(org, bucket, 'ns')

for (let i = 0; i < 5; i++) {
  let point = new Point('measurement1')
    .tag('tagname1', 'tagvalue1')
    .intField('field1', i)

  void setTimeout(() => {
    writeClient.writePoint(point)
  }, i * 1000) // separate points by 1 second

  void setTimeout(() => {
    writeClient.flush()
  }, 5000)
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
      <p>Run the following code in your Nodejs shell:</p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="javascript"
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

export const WriteDataSql = props => {
  return <WriteDataSqlComponent onSelectBucket={props.onSelectBucket} />
}

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
import WriteDataDetailsContextProvider, {
  WriteDataDetailsContext,
} from 'src/writeData/components/WriteDataDetailsContext'

import {getOrg} from 'src/organizations/selectors'
import DataListening from '../DataListening'
import {getBuckets} from '../../../buckets/actions/thunks'

export const WriteDataComponent = () => {
  const org = useSelector(getOrg)

  const codeSnippet = `for value in range(5):
    point = (
        Point("measurement1")
        .tag("tagname1", "tagvalue1")
        .field("field1", value)
    )
    write_api.write(bucket=bucket, org=org, record=point)
    time.sleep(1)`
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getBuckets())
  }, [])

  const {bucket} = useContext(WriteDataDetailsContext)

  const [selectedBucket, setSelectedBucket] = useState(bucket)

  useEffect(() => {
    setSelectedBucket(bucket)
  }, [bucket])


  return (
    <>
        <h1>Write Data</h1>
        <p>
          To start writing data, we need a place to our time-series store data.
          We call these{' '}
          <SafeBlankLink href={`orgs/${org.id}/load-data/buckets`}>
            buckets.
          </SafeBlankLink>
        </p>

        <Panel backgroundColor={InfluxColors.Grey15}>
          <Panel.Body size={ComponentSize.ExtraSmall}>
            <Grid>
              <Grid.Row>
                <Grid.Column widthSM={Columns.Twelve}>
                  <WriteDataHelperBuckets />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Panel.Body>
        </Panel>
        <p>
          You’re ready to write data! In this code, we define five data points
          and write each one for InfluxDB. Paste the following code after the
          prompt (>>>) and press Enter.
        </p>
        <CodeSnippet text={codeSnippet} />
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

export const WriteData = () => {
  return <WriteDataDetailsContextProvider>
    <WriteDataComponent/>
  </WriteDataDetailsContextProvider>
}


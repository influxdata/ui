import React from 'react'
import {useSelector} from 'react-redux'
import {
  Columns,
  ComponentSize,
  Grid,
  InfluxColors,
  Panel,
} from '@influxdata/clockface'

import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import GetResources from 'src/resources/components/GetResources'
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'
import CodeSnippet from 'src/shared/components/CodeSnippet'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'

import {getOrg} from 'src/organizations/selectors'
import {ResourceType} from 'src/types'
import {ListeningDataHeartbeatIcon} from '../HomepageIcons'

export const WriteData = () => {
  const org = useSelector(getOrg)

  const codeSnippet = `for value in range(5):
    point = (
        Point("measurement1")
        .tag("tagname1", "tagvalue1")
        .field("field1", value)
    )
    write_api.write(bucket=bucket, org=org, record=point)
    time.sleep(1)`

  return (
    <>
      <h1>Write Data</h1>
      <p>
        To start writing data, we need a place to our time-series store data. We
        call these{' '}
        <SafeBlankLink href={`orgs/${org.id}/load-data/buckets`}>
          buckets.
        </SafeBlankLink>
      </p>
      <GetResources resources={[ResourceType.Buckets]}>
        <WriteDataDetailsContextProvider>
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
        </WriteDataDetailsContextProvider>
      </GetResources>

      <p>
        You’re ready to write data! In this code, we define five data points and
        write each one for InfluxDB. Paste the following code after the prompt
        (>>>) and press Enter.
      </p>
      <CodeSnippet text={codeSnippet} />
      <p style={{marginTop: '40px'}}>
        Once you this data, you’ll begin to see the confirmation below
      </p>

      <Panel backgroundColor={InfluxColors.Grey15}>
        <Panel.Body>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'IBMPlexMono',
              fontSize: '14px',
              justifyContent: 'center',
            }}
          >
            {ListeningDataHeartbeatIcon}{' '}
            <span style={{marginLeft: '10px'}}>Listening for data...</span>
          </p>
        </Panel.Body>
      </Panel>
    </>
  )
}

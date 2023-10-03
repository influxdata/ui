import React, {useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Columns,
  ComponentSize,
  Grid,
  InfluxColors,
  Panel,
  Table,
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

  const codeSnippet = `let database = \`${bucket.name}\`

const points =
    [
        Point.measurement("census")
            .setTag("location", "Klamath")
            .setIntegerField("bees", 23),
        Point.measurement("census")
            .setTag("location", "Portland")
            .setIntegerField("ants", 30),
        Point.measurement("census")
            .setTag("location", "Klamath")
            .setIntegerField("bees", 28),
        Point.measurement("census")
            .setTag("location", "Portland")
            .setIntegerField("ants", 32),
        Point.measurement("census")
            .setTag("location", "Klamath")
            .setIntegerField("bees", 29),
        Point.measurement("census")
            .setTag("location", "Portland")
            .setIntegerField("ants", 40)
    ];

for (let i = 0; i < points.length; i++) {
    const point = points[i];
    await client.write(point, database)
        // separate points by 1 second
        .then(() => new Promise(resolve => setTimeout(resolve, 1000)));
}
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
      <p style={{marginTop: '24px'}}>
        For this example, we will be writing to our database this simple insect
        census data:
      </p>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>_time</Table.HeaderCell>
            <Table.HeaderCell>_measurement</Table.HeaderCell>
            <Table.HeaderCell>location</Table.HeaderCell>
            <Table.HeaderCell>_field</Table.HeaderCell>
            <Table.HeaderCell>_value</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>2023-01-01T00:00:00Z</Table.Cell>
            <Table.Cell>census</Table.Cell>
            <Table.Cell>Kalmath</Table.Cell>
            <Table.Cell>bees</Table.Cell>
            <Table.Cell>23</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>2023-01-01T00:00:00Z</Table.Cell>
            <Table.Cell>census</Table.Cell>
            <Table.Cell>Portland</Table.Cell>
            <Table.Cell>ants</Table.Cell>
            <Table.Cell>30</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>2023-01-01T00:00:00Z</Table.Cell>
            <Table.Cell>census</Table.Cell>
            <Table.Cell>Kalmath</Table.Cell>
            <Table.Cell>bees</Table.Cell>
            <Table.Cell>28</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>2023-01-01T00:00:00Z</Table.Cell>
            <Table.Cell>census</Table.Cell>
            <Table.Cell>Portland</Table.Cell>
            <Table.Cell>ants</Table.Cell>
            <Table.Cell>32</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>2023-01-01T00:00:00Z</Table.Cell>
            <Table.Cell>census</Table.Cell>
            <Table.Cell>Kalmath</Table.Cell>
            <Table.Cell>bees</Table.Cell>
            <Table.Cell>29</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>2023-01-01T00:00:00Z</Table.Cell>
            <Table.Cell>census</Table.Cell>
            <Table.Cell>Portland</Table.Cell>
            <Table.Cell>ants</Table.Cell>
            <Table.Cell>40</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer />
      </Table>
      <p style={{marginTop: '24px'}}>
        In this data example, we have some important concepts:
      </p>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Term</Table.HeaderCell>
            <Table.HeaderCell>Definition</Table.HeaderCell>
            <Table.HeaderCell>Example Use Case</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <SafeBlankLink
                href="https://docs.influxdata.com/influxdb/cloud/reference/glossary/#measurement"
                onClick={logDocsOpened}
              >
                measurement
              </SafeBlankLink>
            </Table.Cell>
            <Table.Cell>
              Primary filter for the thing you are measuring.
            </Table.Cell>
            <Table.Cell>
              Since we are measuring the sample census of insects, our
              measurement is "census".
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <SafeBlankLink
                href="https://docs.influxdata.com/influxdb/cloud/reference/glossary/#tag"
                onClick={logDocsOpened}
              >
                tag
              </SafeBlankLink>
            </Table.Cell>
            <Table.Cell>
              Key-value pair to store metadata about your fields.
            </Table.Cell>
            <Table.Cell>
              We are storing the "location" of where each census is taken. Tags
              are indexed and should generally be bounded (i.e. only a few
              cities).
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <SafeBlankLink
                href="https://docs.influxdata.com/influxdb/cloud/reference/glossary/#field"
                onClick={logDocsOpened}
              >
                field
              </SafeBlankLink>
            </Table.Cell>
            <Table.Cell>
              Key-value pair that stores the actual data you are measuring.
            </Table.Cell>
            <Table.Cell>
              We are storing the insect "species" and "count" as the key-value
              pair. Fields are not indexed and can be stored as integers,
              floats, strings, or booleans.
            </Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer />
      </Table>
      <p>
        These concepts are important in building your time-series schema. Now,
        let's write this data into our bucket.
      </p>
      <p>
        Add the following code to the{' '}
        <code className="homepage-wizard--code-highlight">main</code> function:
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="javascript"
      />
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

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

type OwnProps = {
  onSelectBucket: (bucketName: string) => void
}

export const WriteDataSqlComponent = (props: OwnProps) => {
  const org = useSelector(getOrg)
  const dispatch = useDispatch()
  const {onSelectBucket} = props

  const logCopyCodeSnippet = () => {
    event('firstMile.javaWizard.writeData.code.copied')
  }

  const logDocsOpened = () => {
    event('firstMile.javaWizard.writeData.docs.opened')
  }

  useEffect(() => {
    dispatch(getBuckets())
  }, [dispatch])

  const {bucket} = useContext(WriteDataDetailsContext)

  const [selectedBucket, setSelectedBucket] = useState(bucket)

  useEffect(() => {
    setSelectedBucket(bucket)
    onSelectBucket(bucket.name)
  }, [bucket, onSelectBucket])

  const internalClass = `    static class CensusRecord {
        String location;
        String species;
        int count;

        public CensusRecord(String location, String species, int count) {
            this.location = location;
            this.species = species;
            this.count = count;
        }

        public String getLocation() {
            return location;
        }

        public String getSpecies() {
            return species;
        }

        public int getCount() {
            return count;
        }
    }`

  const dataPrep = `   String database = "${bucket.name}";

    List<CensusRecord> records = Arrays.asList(
          new CensusRecord("Klamath", "bees", 23),
          new CensusRecord("Portland", "ants", 30),
          new CensusRecord("Klamath", "bees", 28),
          new CensusRecord("Portland", "ants", 32),
          new CensusRecord("Klamath", "bees", 29),
          new CensusRecord("Portland", "ants", 40)
        );

        List<Point> points = new ArrayList<>();

        Instant stamp = Instant.now().minusSeconds(records.size());

        for (CensusRecord record : records) {
            points.add(Point.measurement("census")
              .setTag("location", record.getLocation())
              .setIntegerField(record.getSpecies(), record.getCount())
              .setTimestamp(stamp)
            );
            stamp = stamp.plusSeconds(1);
        }`

  const codeSnippet = `            client.writePoints(points, new WriteOptions.Builder().database(database).build());

            System.out.println("Complete. Return to the InfluxDB UI.");
`

  return (
    <>
      <h1>Write Data</h1>
      <p>
        To start writing data, we need a place to store our time-series data.
        These named storage locations are called{' '}
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
        First, add the following internal class to the
        <code>InfluxClientExample</code> <em>above</em> the <code>main</code>{' '}
        method:
      </p>
      <CodeSnippet
        language="java"
        onCopy={logCopyCodeSnippet}
        text={internalClass}
      />
      <p>
        Then, copy the following data preparation statements, into the{' '}
        <code>main</code> method <em>above</em> the{' '}
        <code>try(InfluxDBClient ...)</code> block:
      </p>
      <CodeSnippet
        language="java"
        onCopy={logCopyCodeSnippet}
        text={dataPrep}
      />
      <p>
        Finally, add the following code <em>within</em> the{' '}
        <code>try(InfluxDBClient ...)</code> block:
      </p>
      <CodeSnippet
        language="java"
        onCopy={logCopyCodeSnippet}
        text={codeSnippet}
      />
      <p>
        Once you write this data, you'll begin to see the confirmation below
      </p>
      <Panel backgroundColor={InfluxColors.Grey15}>
        <Panel.Body>
          <DataListening bucket={selectedBucket.name} />
        </Panel.Body>
      </Panel>
      <p>Once it says "Connection Found!" proceed to the next step.</p>
    </>
  )
}

export const WriteDataSql = props => {
  return <WriteDataSqlComponent onSelectBucket={props.onSelectBucket} />
}

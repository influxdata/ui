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

import {selectCurrentIdentity} from 'src/identity/selectors'
import DataListening from 'src/homepageExperience/components/DataListening'
import {getBuckets} from 'src/buckets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

type OwnProps = {
  onSelectBucket: (bucketName: string) => void
}

export const WriteDataSqlComponent = (props: OwnProps) => {
  const dispatch = useDispatch()
  const {onSelectBucket} = props

  useEffect(() => {
    dispatch(getBuckets())
  }, [dispatch])

  const logCopyInitializeClientSnippet = () => {
    event('firstMile.goWizard.initializeWriteClient.code.copied')
  }

  const logCopyWriteCodeSnippet = () => {
    event('firstMile.goWizard.writeData.code.copied')
  }

  const logCopyInvokeCodeSnippet = () => {
    event('firstMile.goWizard.InvokeWrite.code.copied')
  }

  const logDocsOpened = () => {
    event('firstMile.goWizard.writeData.docs.opened')
  }

  const {org} = useSelector(selectCurrentIdentity)

  const url = org.clusterHost || window.location.origin

  const {bucket} = useContext(WriteDataDetailsContext)

  const [selectedBucket, setSelectedBucket] = useState(bucket)

  useEffect(() => {
    setSelectedBucket(bucket)
    onSelectBucket(bucket.name)
  }, [bucket, onSelectBucket])

  const initializeCodeSnippet = `package main

import (
    "context"
    "fmt"
    "os"
    "time"

    influxdb2 "github.com/influxdata/influxdb-client-go/v2"
)

func main() {}

func dbWrite(ctx context.Context) error {
    // Create write client
    url := "${url}"
    token := os.Getenv("INFLUXDB_TOKEN")
    writeClient := influxdb2.NewClient(url, token)

    // Define write API
    org := "${org.name}"
    bucket := "${bucket.name}"
    writeAPI := writeClient.WriteAPIBlocking(org, bucket)
}`

  const writeCodeSnippet = `data := map[string]map[string]interface{}{
  "point1": {
    "location": "Klamath",
    "species":  "bees",
    "count":    23,
  },
  "point2": {
    "location": "Portland",
    "species":  "ants",
    "count":    30,
  },
  "point3": {
    "location": "Klamath",
    "species":  "bees",
    "count":    28,
  },
  "point4": {
    "location": "Portland",
    "species":  "ants",
    "count":    32,
  },
  "point5": {
    "location": "Klamath",
    "species":  "bees",
    "count":    29,
  },
  "point6": {
    "location": "Portland",
    "species":  "ants",
    "count":    40,
  },
}

// Write data
for key := range data {
  point := influxdb2.NewPointWithMeasurement("census").
    AddTag("location", data[key]["location"].(string)).
    AddField(data[key]["species"].(string), data[key]["count"])

  if err := writeAPI.WritePoint(ctx, point); err != nil {
    return fmt.Errorf("write API write point: %s", err)
  }

  time.Sleep(1 * time.Second) // separate points by 1 second
}

return nil`

  const invokeCodeSnippet = `func main() {
	if err := dbWrite(context.Background()); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\\n", err)
		os.Exit(1)
	}
}`

  return (
    <>
      <h1>Write Data</h1>
      <p>
        To start writing data, we need a place to store our time-series data.
        These named storage locations are called{' '}
        <SafeBlankLink href={`orgs/${org.id}/load-data/buckets`}>
          buckets
        </SafeBlankLink>
        .
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
      <p>
        The first thing we'll do is initialize the write client with the server
        URL and token that are needed to set up the initial connection to
        InfluxDB. We then define our write API with the organization info and
        bucket we intend to write to. These will be added to a new function
        called <code className="homepage-wizard--code-highlight">dbWrite</code>.
      </p>
      <p>
        Paste the following code in your{' '}
        <code className="homepage-wizard--code-highlight">main.go</code> file:
      </p>
      <CodeSnippet
        language="go"
        onCopy={logCopyInitializeClientSnippet}
        text={initializeCodeSnippet}
      />
      <p>
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
      <p>In this data example, we have some important concepts:</p>
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
        Add the following to the end of your{' '}
        <code className="homepage-wizard--code-highlight">dbWrite</code>{' '}
        function:
      </p>
      <CodeSnippet
        language="go"
        onCopy={logCopyWriteCodeSnippet}
        text={writeCodeSnippet}
      />
      <p>
        Invoke your{' '}
        <code className="homepage-wizard--code-highlight">dbWrite</code>{' '}
        function by adding the following as your{' '}
        <code className="homepage-wizard--code-highlight">main</code> function:
      </p>
      <CodeSnippet
        language="go"
        onCopy={logCopyInvokeCodeSnippet}
        text={invokeCodeSnippet}
      />
      <p>
        When you run your program it should now write the data. Once the data is
        written you'll see a confirmation below:
      </p>
      <Panel backgroundColor={InfluxColors.Grey15}>
        <Panel.Body>
          <DataListening bucket={selectedBucket.name} />
        </Panel.Body>
      </Panel>
      <p>Once it says "Connection Found!" procede to the next step.</p>
    </>
  )
}

export const WriteDataSql = props => {
  return <WriteDataSqlComponent onSelectBucket={props.onSelectBucket} />
}

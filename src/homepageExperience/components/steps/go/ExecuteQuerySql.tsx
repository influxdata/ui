// Libraries
import React from 'react'
import {useSelector} from 'react-redux'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {selectCurrentIdentity} from 'src/identity/selectors'

type OwnProps = {
  bucket: string
}

export const ExecuteQuerySql = (props: OwnProps) => {
  const {org: quartzOrg} = useSelector(selectCurrentIdentity)
  const url = quartzOrg.clusterHost || window.location.origin

  const {bucket} = props

  const logCopyInitializeClientSnippet = () => {
    event('firstMile.goWizard.initializeQueryClient.code.copied')
  }

  const logCopyImportsSnippet = () => {
    event('firstMile.goWizard.importLibraries.code.copied')
  }

  const logCopyQueryCodeSnippet = () => {
    event('firstMile.goWizard.executeQuery.code.copied')
  }

  const logCopyInvokeCodeSnippet = () => {
    event('firstMile.goWizard.InvokeQuery.code.copied')
  }

  const initSnippet = `func dbQuery(ctx context.Context) error {
  url := "${url}:443"
  token := os.Getenv("INFLUXDB_TOKEN")
  bucket := "${bucket}"

  // Create a gRPC transport
  pool, err := x509.SystemCertPool()
  if err != nil {
    return fmt.Errorf("x509: %s", err)
  }
  transport := grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(pool, ""))
  opts := []grpc.DialOption{
    transport,
  }

  // Create query client
  client, err := flightsql.NewClient(url, nil, nil, opts...)
  if err != nil {
    return fmt.Errorf("flightsql: %s", err)
  }

  ctx = metadata.AppendToOutgoingContext(ctx, "authorization", "Bearer "+token)
  ctx = metadata.AppendToOutgoingContext(ctx, "bucket-name", bucket)
}`

  const importsSnippet = `import (
  "context"
  "crypto/x509"
  "encoding/json"
  "fmt"
  "os"
  "time"

  "github.com/apache/arrow/go/v12/arrow/flight/flightsql"
  influxdb2 "github.com/influxdata/influxdb-client-go/v2"
  "google.golang.org/grpc"
  "google.golang.org/grpc/credentials"
  "google.golang.org/grpc/metadata"
)`

  const sqlSnippet = `SELECT *
FROM 'census'
WHERE time >= now() - interval '1 hour'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL)`

  const querySnippet = `// Execute query
query := \`SELECT *
          FROM 'census'
          WHERE time >= now() - interval '1 hour'
            AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL)\`

info, err := client.Execute(ctx, query)
if err != nil {
  return fmt.Errorf("flightsql flight info: %s", err)
}
reader, err := client.DoGet(ctx, info.Endpoint[0].Ticket)
if err != nil {
  return fmt.Errorf("flightsql do get: %s", err)
}

// Print results as JSON
for reader.Next() {
  record := reader.Record()
  b, err := json.MarshalIndent(record, "", "  ")
  if err != nil {
    return err
  }
  fmt.Println("RECORD BATCH")
  fmt.Println(string(b))

  if err := reader.Err(); err != nil {
    return fmt.Errorf("flightsql reader: %s", err)
  }
}

return nil`

  const invokeSnippet = `func main() {
  if err := dbQuery(context.Background()); err != nil {
    fmt.Fprintf(os.Stderr, "error: %v\\n", err)
    os.Exit(1)
  }
}`

  const resultPreviewSnippet = `RECORD BATCH
[
  {
    "ants": null,
    "bees": 23,
    "location": "Klamath",
    "time": "2023-02-08 00:50:22.729692187"
  },
  {
    "ants": null,
    "bees": 28,
    "location": "Klamath",
    "time": "2023-02-08 00:50:25.22003343"
  },
  {
    "ants": null,
    "bees": 29,
    "location": "Klamath",
    "time": "2023-02-08 00:50:27.5276304"
  },
  {
    "ants": 40,
    "bees": null,
    "location": "Portland",
    "time": "2023-02-08 00:50:21.465572125"
  },
  {
    "ants": 30,
    "bees": null,
    "location": "Portland",
    "time": "2023-02-08 00:50:23.866994344"
  },
  {
    "ants": 32,
    "bees": null,
    "location": "Portland",
    "time": "2023-02-08 00:50:26.42849497"
  }
]`

  return (
    <>
      <h1>Query Data</h1>
      <p>
        To query our data we'll need to similarly initialize our Query Client.
        We'll do this in a new function called{' '}
        <code className="homepage-wizard--code-highlight">dbQuery</code>. The
        client we use to make our query is{' '}
        <SafeBlankLink href="https://pkg.go.dev/github.com/apache/arrow/go">
          flight-sql
        </SafeBlankLink>
        .
      </p>
      <p>
        Paste the following code as a new function called{' '}
        <code className="homepage-wizard--code-highlight">dbQuery</code>:
      </p>
      <CodeSnippet
        language="go"
        onCopy={logCopyInitializeClientSnippet}
        showCopyControl={true}
        text={initSnippet}
      />
      <p>Ensure your imports match the following:</p>
      <CodeSnippet
        language="go"
        onCopy={logCopyImportsSnippet}
        showCopyControl={true}
        text={importsSnippet}
      />
      <p>
        Now let's query the data we wrote into the database with SQL. Here is
        what our query looks like on its own:
      </p>
      <CodeSnippet language="sql" showCopyControl={false} text={sqlSnippet} />
      <p>
        In this query, we are looking for data points within the last 1 hour
        with a "census" measurement and either "bees" or "ants" fields.
      </p>
      <p>
        Add the following function to the end of your{' '}
        <code className="homepage-wizard--code-highlight">dbQuery</code>{' '}
        function:
      </p>
      <CodeSnippet
        language="go"
        onCopy={logCopyQueryCodeSnippet}
        showCopyControl={true}
        text={querySnippet}
      />
      <p>
        Invoke your{' '}
        <code className="homepage-wizard--code-highlight">dbQuery</code>{' '}
        function by replacing the contents of your{' '}
        <code className="homepage-wizard--code-highlight">main</code> function
        with the following:
      </p>
      <CodeSnippet
        language="go"
        onCopy={logCopyInvokeCodeSnippet}
        showCopyControl={true}
        text={invokeSnippet}
      />
      <p>
        When you run your application now, the code snippet above should print
        out the data you wrote in previous steps. The result should resemble
        this:
      </p>
      <CodeSnippet
        language="json"
        showCopyControl={false}
        text={resultPreviewSnippet}
      />
    </>
  )
}

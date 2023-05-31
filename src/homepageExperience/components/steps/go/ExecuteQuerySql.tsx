// Libraries
import React from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Utils
import {event} from 'src/cloud/utils/reporting'

type OwnProps = {
  bucket: string
}

export const ExecuteQuerySql = (_props: OwnProps) => {
  const logCopyQueryCodeSnippet = () => {
    event('firstMile.goWizard.executeQuery.code.copied')
  }

  const logCopyRunCodeSnippet = () => {
    event('firstMile.goWizard.RunGo.code.copied')
  }

  const sqlSnippet = `SELECT *
FROM 'census'
WHERE time >= now() - interval '1 hour'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL)`

  const querySnippet = `// Execute query
query := \`SELECT *
          FROM 'census'
          WHERE time >= now() - interval '1 hour'
            AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL)\`

iterator, err := client.Query(context.Background(), database, query)

if err != nil {
  panic(err)
}

for iterator.Next() {
  value := iterator.Value()

  location := value["location"]
  ants := value["ants"]
  bees := value["bees"]
  fmt.Printf("in %s are %d ants and %d bees\\n", location, ants, bees)
}
`

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
        To query our data we'll just use{' '}
        <code className="homepage-wizard--code-highlight">Query</code> function
        of the client.
      </p>
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
        <code className="homepage-wizard--code-highlight">main</code> function:
      </p>
      <CodeSnippet
        language="go"
        onCopy={logCopyQueryCodeSnippet}
        showCopyControl={true}
        text={querySnippet}
      />
      <p>You can now run your application again:</p>
      <CodeSnippet
        language="properties"
        onCopy={logCopyRunCodeSnippet}
        text="go run ./main.go"
      />
      <p>
        When you run your application now, the code snippet above should print
        out the data. The result should resemble like this:
      </p>
      <CodeSnippet
        language="json"
        showCopyControl={false}
        text={resultPreviewSnippet}
      />
    </>
  )
}

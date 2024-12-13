// Libraries
import React from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const ExecuteQuerySql = () => {
  const logCopyQueryCodeSnippet = () => {
    event('firstMile.goWizard.executeQuery.code.copied')
  }

  const logCopyRunCodeSnippet = () => {
    event('firstMile.goWizard.runGo.code.copied')
  }

  const sqlSnippet = `SELECT *
FROM 'census'
WHERE time >= now() - interval '1 hour'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL)`

  const querySnippet = `  // Execute query with parameters
  query := \`SELECT *
   FROM 'census'
   WHERE time >= now() - interval '1 hour'
   AND ($species1 IS NOT NULL OR $species2 IS NOT NULL)\`

  iterator, err := client.QueryWithParameters(context.Background(),
	  query, influxdb3.QueryParameters{
		  "species1": "bees",
		  "species2": "ants",
	  },
	  influxdb3.WithDatabase(database))

  if err != nil {
	  panic(err)
  }

  val2int := func(v interface{}) int64 {
	  if v == nil {
		  return 0
	  }
	  return v.(int64)
  }
	
  for iterator.Next() {
	  value := iterator.Value()

	  location := value["location"]
	  ants := val2int(value["ants"])
	  bees := val2int(value["bees"])
	  ts := value["time"].(time.Time)
	  fmt.Printf("At %s in %s there were %d ants and %d bees\\n", 
	    ts.Format(time.RFC3339), location, ants, bees)
  }
`

  const resultPreviewSnippet = `At 2024-12-13T13:33:13Z in Klamath there were 0 ants and 28 bees
At 2024-12-13T13:33:15Z in Klamath there were 0 ants and 29 bees
At 2024-12-13T13:33:17Z in Klamath there were 0 ants and 23 bees
At 2024-12-13T13:33:14Z in Portland there were 32 ants and 0 bees
At 2024-12-13T13:33:16Z in Portland there were 40 ants and 0 bees
At 2024-12-13T13:33:18Z in Portland there were 30 ants and 0 bees`

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
        The following snippet introduces query parameters for the model query above.
        The fixed values "bees" and "ants" are replaced with "species1" and "species2".
        Add this to the end of your{' '}
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
        out the data. The result should resemble this:
      </p>
      <CodeSnippet
        language="json"
        showCopyControl={false}
        text={resultPreviewSnippet}
      />
    </>
  )
}

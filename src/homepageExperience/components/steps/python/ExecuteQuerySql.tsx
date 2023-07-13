import React from 'react'


import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'



const logCopyCodeSnippet = () => {
  event('firstMile.pythonWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuerySql = (props: OwnProps) => {



  const {bucket} = props
// TODO check how this is done
  const sqlSnippet = `SELECT * FROM 'census'
WHERE time >= now() - interval '1 hour'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL)`

  const query = `query = """SELECT * FROM 'census'
WHERE time >= now() - interval '24 hours'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL)"""

# Execute the query
table = client.query(query=query, database="${bucket}", language='sql') )

# Convert to dataframe
df = table.to_pandas().sort_values(by="time")
print(df)
`

  const queryPreview = `     ants  bees  location                          time
  0   NaN  23.0   Klamath 2023-01-18 05:20:46.485256499
  3  30.0   NaN  Portland 2023-01-18 05:20:47.879847987
  1   NaN  28.0   Klamath 2023-01-18 05:20:49.126909775
  4  32.0   NaN  Portland 2023-01-18 05:20:50.636016064
  2   NaN  29.0   Klamath 2023-01-18 05:20:52.047057410
  5  40.0   NaN  Portland 2023-01-18 05:20:53.680696168
`

  return (
    <>
      <h1>Execute a SQL Query</h1>
      <p>
        Now let's query the data we wrote into the database with SQL. Here is
        what our query looks like on its own:
      </p>
      <CodeSnippet
        language="sql"
        onCopy={logCopyCodeSnippet}
        showCopyControl={false}
        text={sqlSnippet}
      />
      <p>
        In this query, we are looking for data points within the last 1 hour
        with a "census" measurement and either "bees" or "ants" fields.
      </p>
      <p>
        Let's use that SQL query in our Python code to show us the results of
        what we have written. We'll use pandas to format the results into a
        table.
      </p>
      <p>Run the following:</p>
      <CodeSnippet language="python" onCopy={logCopyCodeSnippet} text={query} />
      <p>
        The code snippet above should print out the data you wrote in previous
        steps. The result should resemble this:
      </p>
      <CodeSnippet
        language="text"
        onCopy={logCopyCodeSnippet}
        showCopyControl={false}
        text={queryPreview}
      />
    </>
  )
}

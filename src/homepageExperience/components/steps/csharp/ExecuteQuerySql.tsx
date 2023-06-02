import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.csharpWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuerySql = (props: OwnProps) => {
  const {bucket} = props

  const sqlSnippet = `SELECT *
FROM 'census'
WHERE time >= now() - interval '1 hour'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL) order by time asc`

  const query = `const string sql = @"SELECT *
FROM 'census'
WHERE time >= now() - interval '24 hours'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL) order by time asc";
        
Console.WriteLine("{0,-5}{1,-5}{2,-10}{3,-15}", "ants", "bees", "location", "time");
await foreach (var row in client.Query(query: sql, database: "${bucket}"))
{
    Console.WriteLine("{0,-5}{1,-5}{2,-10}{3,-15}", row[0], row[1], row[2], row[3]);
}
`

  const queryPreview = `ants bees location  time           
     23   Klamath   01.06.2023 7:23:02 +00:00
30        Portland  01.06.2023 7:23:04 +00:00
     28   Klamath   01.06.2023 7:23:05 +00:00
32        Portland  01.06.2023 7:23:06 +00:00
     29   Klamath   01.06.2023 7:23:07 +00:00
40        Portland  01.06.2023 7:23:08 +00:00
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
        Let's use that SQL query in our <code>C#</code> code to show us the
        results of what we have written.
      </p>
      <p>
        Add the following code to the <code>IOxExample</code> class:
      </p>
      <CodeSnippet language="csharp" onCopy={logCopyCodeSnippet} text={query} />
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

import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

type OwnProps = {
  bucket: string
}

export const ExecuteQuerySql = (props: OwnProps) => {
  const {bucket} = props

  const logCopyCodeSnippet = () => {
    event('firstMile.javaWizard.executeQuery.code.copied')
  }

  const sqlSnippet = `SELECT *
FROM 'census'
WHERE time >= now() - interval '1 hour'
AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL) order by time asc`

  const query = `String sql = "SELECT * " +
        "FROM 'census' " +
        "WHERE time >= now() - interval '1 hour' " +
        "AND ('bees' IS NOT NULL OR 'ants' IS NOT NULL) order by time asc";

System.out.printf("| %-5s | %-5s | %-8s | %-30s |%n", "ants", "bees", "location", "time");
try (Stream<Object[]> stream = client.query(sql, new QueryParameters("${bucket}", QueryType.SQL))) {
    stream.forEach(row -> System.out.printf("| %-5s | %-5s | %-8s | %-30s |%n",  row[0], row[1], row[2], row[3]));
}
`

  const queryPreview = `| ants  | bees  | location | time                           |
| null  | 23    | Klamath  | 2023-06-02T10:21:21.083529279  |
| 30    | null  | Portland | 2023-06-02T10:21:22.276295461  |
| null  | 28    | Klamath  | 2023-06-02T10:21:23.462901032  |
| 32    | null  | Portland | 2023-06-02T10:21:24.608998154  |
| null  | 29    | Klamath  | 2023-06-02T10:21:25.762346305  |
| 40    | null  | Portland | 2023-06-02T10:21:26.901005154  |
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
        Let's use that SQL query in our <code>Java</code> code to show us the
        results of what we have written.
      </p>
      <p>
        Add the following code to the <code>WriteQueryExample</code> class:
      </p>
      <CodeSnippet language="java" onCopy={logCopyCodeSnippet} text={query} />
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

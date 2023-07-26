import React from 'react'

import CodeSnippet from 'src/shared/components/CodeSnippet'
import {event} from 'src/cloud/utils/reporting'

const logCopyCodeSnippet = () => {
  event('firstMile.nodejsWizard.executeQuery.code.copied')
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

  const query = `const query = \`SELECT * FROM 'census' 
WHERE time >= now() - interval '24 hours' AND 
('bees' IS NOT NULL OR 'ants' IS NOT NULL) order by time asc\`

const rows = await client.query(query, \'${bucket}\')

console.log(\`\${"ants".padEnd(5)}\${"bees".padEnd(5)}\${"location".padEnd(10)}\${"time".padEnd(15)}\`);
for await (const row of rows) {
    let ants = row.ants || '';
    let bees = row.bees || '';
    let time = new Date(row.time);
    console.log(\`\${ants.toString().padEnd(5)}\${bees.toString().padEnd(5)}\${row.location.padEnd(10)}\${time.toString().padEnd(15)}\`);
}`

  const queryPreview = `ants bees location  time           
     23   Klamath   Fri Jul 21 2023 7:23:02 +00:00
30        Portland  Fri Jul 21 2023 7:23:04 +00:00
     28   Klamath   Fri Jul 21 2023 7:23:05 +00:00
32        Portland  Fri Jul 21 2023 7:23:06 +00:00
     29   Klamath   Fri Jul 21 2023 7:23:07 +00:00
40        Portland  Fri Jul 21 2023 7:23:08 +00:00
`

  return (
    <>
      <h1>Execute a SQL Query</h1>
      <p>
        Now let's query the data we wrote into the database with SQL. Here is
        what our query looks like on its own:
      </p>
      <CodeSnippet
        text={sqlSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="sql"
      />
      <p>
        In this query, we are looking for data points within the last 1 hour
        with a "census" measurement and either "bees" or "ants" fields.
      </p>
      <p>
        Let's use that SQL query in our{' '}
        <code className="homepage-wizard--code-highlight">Node.js</code> code to
        show us the results of what we have written.
      </p>
      <p>
        Add the following code to the{' '}
        <code className="homepage-wizard--code-highlight">main</code> function:
      </p>
      <CodeSnippet
        text={query}
        onCopy={logCopyCodeSnippet}
        language="javascript"
      />
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

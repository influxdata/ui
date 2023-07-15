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

  const sqlSnippet = `SELECT * FROM 'measurement1'`

  const query = `const query = \`SELECT * FROM 'measurement1'\`

const rows = await client.query(query, "${bucket}")
for await (const row of rows) {
    console.log(\`tagname1 is \${row.tagname1}\`)
    console.log(\`field1 is \${row.field1}\`)
}`

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
        language="properties"
      />
      <p>
        In this query, we are looking for data points within the last 10 minutes
        with a measurement of "measurement1".
      </p>
      <p>
        Let's use that SQL query in our <code>Node.js</code> code to show us the
        results of what we have written.
      </p>
      <p>
        Add the following code to the <code>main</code> function:
      </p>
      <CodeSnippet
        text={query}
        onCopy={logCopyCodeSnippet}
        language="javascript"
      />
    </>
  )
}

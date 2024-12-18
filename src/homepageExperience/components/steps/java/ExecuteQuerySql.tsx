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

  const query = `            String sql = "SELECT * " +
              "FROM 'census' " +
              "WHERE time >= now() - interval '5 minutes' " +
              "AND ('$species1' IS NOT NULL OR '$species2' IS NOT NULL) order by time asc";

            System.out.printf("| %-5s | %-5s | %-8s | %-30s |%n", "ants", "bees", "location", "time");

            try (Stream<PointValues> ps = client.queryPoints(sql,
              Map.of(
                "species1", "bees",
                "species2", "ants"),  // Set Query Parameters
              new QueryOptions("${bucket}", QueryType.SQL))) { // Set Query Options
                ps.forEach(pv ->
                    System.out.printf("| %-5s | %-5s | %-8s | %-30s |%n",
                  IntOrDefault(pv, "ants", 0),
                  IntOrDefault(pv,"bees", 0),
                  pv.getTag("location"),
                  InstantTime(pv, Instant.ofEpochSecond(0))));
            }
`

  const queryPreview = `| ants  | bees  | location | time                           |
| 0     | 23    | Klamath  | 2024-12-18T15:58:07.275779579Z |
| 30    | 0     | Portland | 2024-12-18T15:58:08.275779579Z |
| 0     | 28    | Klamath  | 2024-12-18T15:58:09.275779579Z |
| 32    | 0     | Portland | 2024-12-18T15:58:10.275779579Z |
| 0     | 29    | Klamath  | 2024-12-18T15:58:11.275779579Z |
| 40    | 0     | Portland | 2024-12-18T15:58:12.275779579Z |
`

  const staticHelpers = `    private static long IntOrDefault(final PointValues pointValues,
                                     final String key,
                                     final long defaultValue){
        Long result = pointValues.getIntegerField(key);
        return result == null ? defaultValue : result;
    }

    private static Instant InstantTime(final PointValues pointValues,
                                       final Instant replacement){
        Number raw = pointValues.getTimestamp();
        if(raw == null) {
            if (replacement == null){
                return Instant.ofEpochSecond(0);
            }
            return replacement;
        }
        long stamp = raw.longValue();
        long sec = stamp / 1000000000;
        long nanos = stamp % 1000000000;
        return Instant.ofEpochSecond(sec, nanos);
    }
`

  return (
    <>
      <h1>Execute a SQL Query</h1>
      <p>The query transport makes use of Apache Arrow Flight to
      shorten processing time.  When executing queries Arrow needs
      access to internal JVM resources.  This means setting the
        following JVM argument: <code>--add-opens=java.base/java.nio=ALL-UNNAMED</code></p>
      <h2>Java</h2>
      <p>With straightforward Java this can be done with an
        environment variable:</p>
      <CodeSnippet
         language="bash"
         onCopy={logCopyCodeSnippet}
         showCopyControl={false}
         text='export JDK_JAVA_OPTIONS="--add-opens=java.base/java.nio=ALL-UNNAMED"'
      />
      <h2>Maven</h2>
      <p>This argument can also be added to <code>MAVEN_OPTS</code>:</p>
      <CodeSnippet
        language="bash"
        onCopy={logCopyCodeSnippet}
        showCopyControl={false}
        text='export MAVEN_OPTS="--add-opens=java.base/java.nio=ALL-UNNAMED"'
      />
      <h2>Gradle</h2>
      <p>With gradle this can be added to the build file, e.g. in <code>build.gradle.kts</code>:</p>
      <CodeSnippet
        language="kotlin"
        onCopy={logCopyCodeSnippet}
        showCopyControl={false}
        text='...
application {
    mainClass = "example.InfluxClientExample"
    applicationDefaultJvmArgs = listOf("--add-opens=java.base/java.nio=ALL-UNNAMED")
}
...'
      />

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
      <p>The client API will pass through null values for mismatched or missing
      tags, fields and timestamps.  In anticipation of this possibility copy the
      following static helper methods to the bottom of
        the <code>InfluxClientExample</code> class.</p>
      <CodeSnippet
        language="java"
        onCopy={logCopyCodeSnippet}
        text={staticHelpers}
      />
      <p>
        Now let's use the model SQL query in our <code>Java</code> code
        to show us the results of what we have written.  Furthermore, let's use the SQL query
        parameters feature of the client library to make query calls more
        dynamic.
      </p>
      <p>
        The following code replaces the fixed values of "bees" and "ants"
        with the parameters <code>$species1</code> and <code>$species2</code>.
        Add it to the <code>InfluxClientExample</code> class <em>after</em> the
        write code added in the previous step:
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

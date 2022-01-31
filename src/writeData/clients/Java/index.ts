import logo from 'src/writeData/clients/Java/logo.svg'
import description from 'src/writeData/clients/Java/description.md'
import initialize from 'src/writeData/clients/Java/initialize.example'
import writeLP from 'src/writeData/clients/Java/write.0.example'
import writePoint from 'src/writeData/clients/Java/write.1.example'
import writePOJO from 'src/writeData/clients/Java/write.2.example'
import execute from 'src/writeData/clients/Java/execute.example'
import query from 'src/writeData/clients/Java/query.example'
import executeFull from 'src/writeData/clients/Java/executeFull.example'
import dispose from 'src/writeData/clients/Java/dispose.example'

export default register =>
  register({
    id: 'java',
    name: 'Java',
    description,
    logo,
    initialize,
    write: [
      {
        title: 'Use InfluxDB Line Protocol to write data',
        code: writeLP,
      },
      {
        title: 'Use a Data Point to write data',
        code: writePoint,
      },
      {
        title: 'Use POJO and corresponding class to write data',
        code: writePOJO,
      },
    ],
    execute,
    query,
    querySanitize: (query: string) => {
      return (
        query
          // escape double quotes
          .replace(/"/g, '\\"')
          // split to rows
          .split('\n')
          // format to multiline string
          .map((line, index, origin) => {
            let endOfLine
            // last lane doesn't have '\n +'
            if (origin.length == index + 1) {
              endOfLine = '"'
            } else {
              endOfLine = '\\n" +'
            }
            return `"${line}${endOfLine}`
          })
          .join('\n')
      )
    },
    executeFull,
    dispose,
  })

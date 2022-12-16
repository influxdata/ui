import description from 'src/writeData/clients/Java/description.md'
import dispose from 'src/writeData/clients/Java/dispose.example'
import execute from 'src/writeData/clients/Java/execute.example'
import executeFull from 'src/writeData/clients/Java/executeFull.example'
import initialize from 'src/writeData/clients/Java/initialize.example'
import logo from 'src/writeData/clients/Java/logo.svg'
import query from 'src/writeData/clients/Java/query.example'
import writeLP from 'src/writeData/clients/Java/write.0.example'
import writePOJO from 'src/writeData/clients/Java/write.2.example'
import writePoint from 'src/writeData/clients/Java/write.1.example'
import {ClientRegistration} from 'src/writeData'

export class Client implements ClientRegistration {
  id = 'java'
  name = 'Java'
  description = description
  logo = logo
  initialize = initialize
  write = [
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
  ]
  execute = execute
  query = query
  querySanitize = (query: string) => {
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
  }
  executeFull = executeFull
  dispose = dispose
}

import description from 'src/writeData/clients/PHP/description.md'
import dispose from 'src/writeData/clients/PHP/dispose.example'
import execute from 'src/writeData/clients/PHP/execute.example'
import executeFull from 'src/writeData/clients/PHP/executeFull.example'
import initialize from 'src/writeData/clients/PHP/initialize.example'
import logo from 'src/writeData/clients/PHP/logo.svg'
import query from 'src/writeData/clients/PHP/query.example'
import writeArray from 'src/writeData/clients/PHP/write.2.example'
import writeLP from 'src/writeData/clients/PHP/write.0.example'
import writePoint from 'src/writeData/clients/PHP/write.1.example'
import {ClientRegistration} from 'src/writeData'

export class Client implements ClientRegistration {
  id = 'php'
  name = 'PHP'
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
      title: 'Use Array structure to write data',
      code: writeArray,
    },
  ]
  execute = execute
  query = query
  dispose = dispose
  executeFull = executeFull
  querySanitize = (query: string) => {
    return query.replace(/"/g, '\\"')
  }
}

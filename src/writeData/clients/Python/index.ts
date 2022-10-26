import description from 'src/writeData/clients/Python/description.md'
import dispose from 'src/writeData/clients/Python/dispose.example'
import execute from 'src/writeData/clients/Python/execute.example'
import executeFull from 'src/writeData/clients/Python/executeFull.example'
import initialize from 'src/writeData/clients/Python/initialize.example'
import logo from 'src/writeData/clients/Python/logo.svg'
import query from 'src/writeData/clients/Python/query.example'
import writeBatch from 'src/writeData/clients/Python/write.2.example'
import writeLP from 'src/writeData/clients/Python/write.0.example'
import writePoint from 'src/writeData/clients/Python/write.1.example'
import {ClientRegistration} from 'src/writeData'

export class Client implements ClientRegistration {
  id = 'python'
  name = 'Python'
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
      title: 'Use a Batch Sequence to write data',
      code: writeBatch,
    },
  ]
  execute = execute
  query = query
  dispose = dispose
  executeFull = executeFull
}

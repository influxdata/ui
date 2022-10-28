import description from 'src/writeData/clients/Ruby/description.md'
import dispose from 'src/writeData/clients/Ruby/dispose.example'
import execute from 'src/writeData/clients/Ruby/execute.example'
import executeFull from 'src/writeData/clients/Ruby/executeFull.example'
import initialize from 'src/writeData/clients/Ruby/initialize.example'
import logo from 'src/writeData/clients/Ruby/logo.svg'
import query from 'src/writeData/clients/Ruby/query.example'
import writeBatch from 'src/writeData/clients/Ruby/write.3.example'
import writeHash from 'src/writeData/clients/Ruby/write.2.example'
import writeLP from 'src/writeData/clients/Ruby/write.0.example'
import writePoint from 'src/writeData/clients/Ruby/write.1.example'
import {ClientRegistration} from 'src/writeData'

export class Client implements ClientRegistration {
  id = 'ruby'
  name = 'Ruby'
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
      title: 'Use a Hash to write data',
      code: writeHash,
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

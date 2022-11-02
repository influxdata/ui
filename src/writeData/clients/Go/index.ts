import description from 'src/writeData/clients/Go/description.md'
import execute from 'src/writeData/clients/Go/execute.example'
import executeFull from 'src/writeData/clients/Go/executeFull.example'
import initialize from 'src/writeData/clients/Go/initialize.example'
import logo from 'src/writeData/clients/Go/logo.svg'
import query from 'src/writeData/clients/Go/query.example'
import writeLP from 'src/writeData/clients/Go/write.0.example'
import writePoint from 'src/writeData/clients/Go/write.1.example'
import {ClientRegistration} from 'src/writeData'

export class Client implements ClientRegistration {
  id = 'go'
  name = 'GO'
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
  ]
  execute = execute
  query = query
  executeFull = executeFull
}

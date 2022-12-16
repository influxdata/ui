import description from 'src/writeData/clients/Javascript/description.md'
import execute from 'src/writeData/clients/Javascript/execute.example'
import executeFull from 'src/writeData/clients/Javascript/executeFull.example'
import initialize from 'src/writeData/clients/Javascript/initialize.example'
import logo from 'src/writeData/clients/Javascript/logo.svg'
import query from 'src/writeData/clients/Javascript/query.example'
import write from 'src/writeData/clients/Javascript/write.example'
import {ClientRegistration} from 'src/writeData'

export class Client implements ClientRegistration {
  id = 'javascript-node'
  name = 'Node.js'
  description = description
  logo = logo
  initialize = initialize
  write = write
  execute = execute
  query = query
  executeFull = executeFull
}

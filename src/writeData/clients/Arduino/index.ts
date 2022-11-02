import description from 'src/writeData/clients/Arduino/description.md'
import execute from 'src/writeData/clients/Arduino/execute.example'
import executeFull from 'src/writeData/clients/Arduino/executeFull.example'
import initialize from 'src/writeData/clients/Arduino/initialize.example'
import logo from 'src/writeData/clients/Arduino/logo.svg'
import query from 'src/writeData/clients/Arduino/query.example'
import write from 'src/writeData/clients/Arduino/write.example'
import {ClientRegistration} from 'src/writeData'

export class Client implements ClientRegistration {
  id = 'arduino'
  name = 'Arduino'
  description = description
  logo = logo
  initialize = initialize
  write = write
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
          // last lane doesn't have line continuation char '\'
          if (origin.length == index + 1) {
            endOfLine = ''
          } else {
            endOfLine = ' \\'
          }
          return `${line}${endOfLine}`
        })
        .join('\n')
    )
  }
  executeFull = executeFull
}

import description from 'src/writeData/clients/CSharp/description.md'
import execute from 'src/writeData/clients/CSharp/execute.example'
import executeFull from 'src/writeData/clients/CSharp/executeFull.example'
import initialize from 'src/writeData/clients/CSharp/initialize.example'
import logo from 'src/writeData/clients/CSharp/logo.svg'
import query from 'src/writeData/clients/CSharp/query.example'
import writeLP from 'src/writeData/clients/CSharp/write.0.example'
import writePOCO from 'src/writeData/clients/CSharp/write.2.example'
import writePoint from 'src/writeData/clients/CSharp/write.1.example'
import {ClientRegistration} from 'src/writeData'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const isTSMOnboarding = !isFlagEnabled('ioxOnboarding')
export class Client implements ClientRegistration {
  id = 'csharp'
  name = 'C#'
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
      title: 'Use POCO and corresponding class to write data',
      code: writePOCO,
    },
  ]
  execute = isTSMOnboarding && execute
  query = isTSMOnboarding && query
  querySanitize = (query: string) => {
    return query.replace(/"/g, '""')
  }
  executeFull = isTSMOnboarding && executeFull
}

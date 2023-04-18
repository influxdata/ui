import description from 'src/writeData/clients/Kotlin/description.md'
import dispose from 'src/writeData/clients/Kotlin/dispose.example'
import execute from 'src/writeData/clients/Kotlin/execute.example'
import executeFull from 'src/writeData/clients/Kotlin/executeFull.example'
import initialize from 'src/writeData/clients/Kotlin/initialize.example'
import logo from 'src/writeData/clients/Kotlin/logo.svg'
import query from 'src/writeData/clients/Kotlin/query.example'
import writeLP from 'src/writeData/clients/Kotlin/write.0.example'
import writePOJO from 'src/writeData/clients/Kotlin/write.2.example'
import writePoint from 'src/writeData/clients/Kotlin/write.1.example'
import {ClientRegistration} from 'src/writeData'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const isTSMOnboarding = !isFlagEnabled('ioxOnboarding')
export class Client implements ClientRegistration {
  id = 'kotlin'
  name = 'Kotlin'
  description = description
  logo = logo
  initialize = initialize
  execute = isTSMOnboarding && execute
  query = isTSMOnboarding && query
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
  dispose = dispose
  executeFull = isTSMOnboarding && executeFull
}

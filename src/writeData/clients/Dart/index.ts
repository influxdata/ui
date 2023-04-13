import description from 'src/writeData/clients/Dart/description.md'
import dispose from 'src/writeData/clients/Dart/dispose.example'
import execute from 'src/writeData/clients/Dart/execute.example'
import executeFull from 'src/writeData/clients/Dart/executeFull.example'
import initialize from 'src/writeData/clients/Dart/initialize.example'
import logo from 'src/writeData/clients/Dart/logo.svg'
import query from 'src/writeData/clients/Dart/query.example'
import writeLP from 'src/writeData/clients/Dart/write.0.example'
import writePoint from 'src/writeData/clients/Dart/write.1.example'
import {ClientRegistration} from 'src/writeData'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const isTSMOnboarding = !isFlagEnabled('ioxOnboarding')
export class Client implements ClientRegistration {
  id = 'dart'
  name = 'Dart'
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
  execute = isTSMOnboarding && execute
  query = isTSMOnboarding && query
  executeFull = isTSMOnboarding && executeFull
  dispose = dispose
}

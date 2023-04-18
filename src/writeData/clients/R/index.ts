import description from 'src/writeData/clients/R/description.md'
import execute from 'src/writeData/clients/R/execute.example'
import initialize from 'src/writeData/clients/R/initialize.example'
import logo from 'src/writeData/clients/R/logo.svg'
import query from 'src/writeData/clients/R/query.example'
import write from 'src/writeData/clients/R/write.example'
import {ClientRegistration} from 'src/writeData'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const isTSMOnboarding = !isFlagEnabled('ioxOnboarding')
export class Client implements ClientRegistration {
  id = 'r'
  name = 'R'
  featureFlag = 'client-library--r'
  description = description
  logo = logo
  initialize = initialize
  write = write
  execute = isTSMOnboarding && execute
  query = isTSMOnboarding && query
}

import description from 'src/writeData/clients/Swift/description.md'
import dispose from 'src/writeData/clients/Swift/dispose.example'
import execute from 'src/writeData/clients/Swift/execute.example'
import executeFull from 'src/writeData/clients/Swift/executeFull.example'
import initialize from 'src/writeData/clients/Swift/initialize.example'
import logo from 'src/writeData/clients/Swift/logo.svg'
import query from 'src/writeData/clients/Swift/query.example'
import writeLP from 'src/writeData/clients/Swift/write.0.example'
import writePoint from 'src/writeData/clients/Swift/write.1.example'
import writeTuple from 'src/writeData/clients/Swift/write.2.example'
import {ClientRegistration} from 'src/writeData'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {useSelector} from 'react-redux'
import {isOrgIOx} from 'src/organizations/selectors'

const isTSMOnboarding = !useSelector(isOrgIOx)
export class Client implements ClientRegistration {
  id = 'swift'
  name = 'Swift'
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
      title: 'Use Tuple to write data',
      code: writeTuple,
    },
  ]
  execute = isTSMOnboarding && execute
  query = isTSMOnboarding && query
  dispose = dispose
  executeFull = isTSMOnboarding && executeFull
}

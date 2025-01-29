import description from 'src/writeData/clients/Scala/description.md'
import dispose from 'src/writeData/clients/Scala/dispose.example'
import execute from 'src/writeData/clients/Scala/execute.example'
import executeFull from 'src/writeData/clients/Scala/executeFull.example'
import initialize from 'src/writeData/clients/Scala/initialize.example'
import logo from 'src/writeData/clients/Scala/logo.svg'
import query from 'src/writeData/clients/Scala/query.example'
import writeLP from 'src/writeData/clients/Scala/write.0.example'
import writePOJO from 'src/writeData/clients/Scala/write.2.example'
import writePoint from 'src/writeData/clients/Scala/write.1.example'
import {ClientRegistration} from 'src/writeData'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {useSelector} from 'react-redux'
import {isOrgIOx} from 'src/organizations/selectors'

const isTSMOnboarding = !useSelector(isOrgIOx)

export class Client implements ClientRegistration {
  id = 'scala'
  name = 'Scala'
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

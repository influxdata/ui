import logo from 'src/writeData/clients/Scala/logo.svg'
import description from 'src/writeData/clients/Scala/description.md'
import initialize from 'src/writeData/clients/Scala/initialize.example'
import execute from 'src/writeData/clients/Scala/execute.example'
import query from 'src/writeData/clients/Scala/query.example'

export default register =>
  register({
    id: 'scala',
    name: 'Scala',
    featureFlag: 'client-library--scala',
    description,
    logo,
    initialize,
    execute,
    query,
  })

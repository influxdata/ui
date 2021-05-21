import logo from 'src/writeData/clients/Kotlin/logo.svg'
import description from 'src/writeData/clients/Kotlin/description.md'
import initialize from 'src/writeData/clients/Kotlin/initialize.example'
import execute from 'src/writeData/clients/Kotlin/execute.example'
import query from 'src/writeData/clients/Kotlin/query.example'

export default register =>
  register({
    id: 'kotlin',
    name: 'Kotlin',
    featureFlag: 'client-library--kotlin',
    description,
    logo,
    initialize,
    execute,
    query,
  })

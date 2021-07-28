import logo from 'src/writeData/clients/R/logo.svg'
import description from 'src/writeData/clients/R/description.md'
import initialize from 'src/writeData/clients/R/initialize.example'
import write from 'src/writeData/clients/R/write.example'
import execute from 'src/writeData/clients/R/execute.example'
import query from 'src/writeData/clients/R/query.example'

export default register =>
  register({
    id: 'r',
    name: 'R',
    featureFlag: 'client-library--r',
    description,
    logo,
    initialize,
    write,
    execute,
    query,
  })

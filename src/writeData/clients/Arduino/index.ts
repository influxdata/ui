import logo from 'src/writeData/clients/Arduino/logo.svg'
import description from 'src/writeData/clients/Arduino/description.md'
import initialize from 'src/writeData/clients/Arduino/initialize.example'
import write from 'src/writeData/clients/Arduino/write.example'
import execute from 'src/writeData/clients/Arduino/execute.example'
import query from 'src/writeData/clients/Arduino/query.example'

export default register =>
  register({
    id: 'arduino',
    name: 'Arduino',
    featureFlag: 'client-library--arduino',
    description,
    logo,
    initialize,
    write,
    execute,
    query,
  })

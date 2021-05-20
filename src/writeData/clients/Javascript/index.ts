import logo from 'src/writeData/clients/Javascript/logo.svg'
import description from 'src/writeData/clients/Javascript/description.md'
import initialize from 'src/writeData/clients/Javascript/initialize.example'
import write from 'src/writeData/clients/Javascript/write.example'
import execute from 'src/writeData/clients/Javascript/execute.example'
import query from 'src/writeData/clients/Javascript/query.example'

export default register =>
  register({
    id: 'javascript-node',
    name: 'JavaScript/Node.js',
    featureFlag: 'client-library--javascript',
    description,
    logo,
    initialize,
    write,
    execute,
    query,
  })

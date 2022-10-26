import logo from 'src/writeData/clients/Javascript/logo.svg'
import description from 'src/writeData/clients/Javascript/description.md'
import initialize from 'src/writeData/clients/Javascript/initialize.example'
import write from 'src/writeData/clients/Javascript/write.example'
import execute from 'src/writeData/clients/Javascript/execute.example'
import query from 'src/writeData/clients/Javascript/query.example'
import executeFull from 'src/writeData/clients/Javascript/executeFull.example'

export default register =>
  register({
    id: 'javascript-node',
    name: 'JavaScript',
    description,
    logo,
    initialize,
    write,
    execute,
    query,
    executeFull,
  })

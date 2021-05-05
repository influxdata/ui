import logo from 'src/writeData/clients/Go/logo.svg'
import description from 'src/writeData/clients/Go/description.md'
import initialize from 'src/writeData/clients/Go/initialize.example'
import writeLP from 'src/writeData/clients/Go/write.0.example'
import writePoint from 'src/writeData/clients/Go/write.1.example'
import execute from 'src/writeData/clients/Go/execute.example'
import query from 'src/writeData/clients/Go/query.example'

export default register =>
  register({
    id: 'go',
    name: 'GO',
    featureFlag: 'client-library--go',
    description,
    logo,
    initialize,
    write: [
      {
        title: 'Use InfluxDB Line Protocol to write data',
        code: writeLP,
      },
      {
        title: 'Use a Data Point to write data',
        code: writePoint,
      },
    ],
    execute,
    query,
  })

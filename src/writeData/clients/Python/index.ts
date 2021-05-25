import logo from 'src/writeData/clients/Python/logo.svg'
import description from 'src/writeData/clients/Python/description.md'
import initialize from 'src/writeData/clients/Python/initialize.example'
import writeLP from 'src/writeData/clients/Python/write.0.example'
import writePoint from 'src/writeData/clients/Python/write.1.example'
import writeBatch from 'src/writeData/clients/Python/write.2.example'
import execute from 'src/writeData/clients/Python/execute.example'
import query from 'src/writeData/clients/Python/query.example'

export default register =>
  register({
    id: 'python',
    name: 'Python',
    featureFlag: 'client-library--python',
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
      {
        title: 'Use a Batch Sequence to write data',
        code: writeBatch,
      },
    ],
    execute,
    query,
  })

import logo from 'src/writeData/clients/Swift/logo.svg'
import description from 'src/writeData/clients/Swift/description.md'
import initialize from 'src/writeData/clients/Swift/initialize.example'
import writeLP from 'src/writeData/clients/Swift/write.0.example'
import writePoint from 'src/writeData/clients/Swift/write.1.example'
import writeTuple from 'src/writeData/clients/Swift/write.2.example'
import execute from 'src/writeData/clients/Swift/execute.example'
import query from 'src/writeData/clients/Swift/query.example'

export default register =>
  register({
    id: 'swift',
    name: 'Swift',
    featureFlag: 'client-library--swift',
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
        title: 'Use Tuple to write data',
        code: writeTuple,
      },
    ],
    execute,
    query,
  })

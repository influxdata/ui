import logo from 'src/writeData/clients/PHP/logo.svg'
import description from 'src/writeData/clients/PHP/description.md'
import initialize from 'src/writeData/clients/PHP/initialize.example'
import writeLP from 'src/writeData/clients/PHP/write.0.example'
import writePoint from 'src/writeData/clients/PHP/write.1.example'
import writeArray from 'src/writeData/clients/PHP/write.2.example'
import execute from 'src/writeData/clients/PHP/execute.example'
import query from 'src/writeData/clients/PHP/query.example'

export default register =>
  register({
    id: 'php',
    name: 'PHP',
    featureFlag: 'client-library--php',
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
        title: 'Use Array structure to write data',
        code: writeArray,
      },
    ],
    execute,
    query,
  })

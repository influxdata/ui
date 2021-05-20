import logo from 'src/writeData/clients/Java/logo.svg'
import description from 'src/writeData/clients/Java/description.md'
import initialize from 'src/writeData/clients/Java/initialize.example'
import writeLP from 'src/writeData/clients/Java/write.0.example'
import writePoint from 'src/writeData/clients/Java/write.1.example'
import writePOJO from 'src/writeData/clients/Java/write.2.example'
import execute from 'src/writeData/clients/Java/execute.example'
import query from 'src/writeData/clients/Java/query.example'

export default register =>
  register({
    id: 'java',
    name: 'Java',
    featureFlag: 'client-library--java',
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
        title: 'Use POJO and corresponding class to write data',
        code: writePOJO,
      },
    ],
    execute,
    query,
  })

import logo from 'src/writeData/clients/Kotlin/logo.svg'
import description from 'src/writeData/clients/Kotlin/description.md'
import initialize from 'src/writeData/clients/Kotlin/initialize.example'
import execute from 'src/writeData/clients/Kotlin/execute.example'
import query from 'src/writeData/clients/Kotlin/query.example'
import writeLP from 'src/writeData/clients/Kotlin/write.0.example'
import writePoint from 'src/writeData/clients/Kotlin/write.1.example'
import writePOJO from 'src/writeData/clients/Kotlin/write.2.example'
import dispose from 'src/writeData/clients/Kotlin/dispose.example'
import executeFull from 'src/writeData/clients/Kotlin/executeFull.example'

export default register =>
  register({
    id: 'kotlin',
    name: 'Kotlin',
    description,
    logo,
    initialize,
    execute,
    query,
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
    dispose,
    executeFull,
  })

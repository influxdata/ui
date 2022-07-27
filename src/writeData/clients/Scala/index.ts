import logo from 'src/writeData/clients/Scala/logo.svg'
import description from 'src/writeData/clients/Scala/description.md'
import initialize from 'src/writeData/clients/Scala/initialize.example'
import execute from 'src/writeData/clients/Scala/execute.example'
import query from 'src/writeData/clients/Scala/query.example'
import writeLP from 'src/writeData/clients/Scala/write.0.example'
import writePoint from 'src/writeData/clients/Scala/write.1.example'
import writePOJO from 'src/writeData/clients/Scala/write.2.example'
import dispose from 'src/writeData/clients/Scala/dispose.example'
import executeFull from 'src/writeData/clients/Scala/executeFull.example'

export default register =>
  register({
    id: 'scala',
    name: 'Scala',
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

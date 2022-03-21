import logo from 'src/writeData/clients/Dart/logo.svg'
import description from 'src/writeData/clients/Dart/description.md'
import initialize from 'src/writeData/clients/Dart/initialize.example'
import writeLP from 'src/writeData/clients/Dart/write.0.example'
import writePoint from 'src/writeData/clients/Dart/write.1.example'
import execute from 'src/writeData/clients/Dart/execute.example'
import query from 'src/writeData/clients/Dart/query.example'
import executeFull from 'src/writeData/clients/Dart/executeFull.example'
import dispose from 'src/writeData/clients/Dart/dispose.example'

export default register =>
  register({
    id: 'dart',
    name: 'Dart',
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
    executeFull,
    dispose,
  })

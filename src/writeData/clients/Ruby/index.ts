import logo from 'src/writeData/clients/Ruby/logo.svg'
import description from 'src/writeData/clients/Ruby/description.md'
import initialize from 'src/writeData/clients/Ruby/initialize.example'
import writeLP from 'src/writeData/clients/Ruby/write.0.example'
import writePoint from 'src/writeData/clients/Ruby/write.1.example'
import writeHash from 'src/writeData/clients/Ruby/write.2.example'
import writeBatch from 'src/writeData/clients/Ruby/write.3.example'
import execute from 'src/writeData/clients/Ruby/execute.example'
import query from 'src/writeData/clients/Ruby/query.example'

export default register =>
  register({
    id: 'ruby',
    name: 'Ruby',
    featureFlag: 'client-library--ruby',
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
        title: 'Use a Hash to write data',
        code: writeHash,
      },
      {
        title: 'Use a Batch Sequence to write data',
        code: writeBatch,
      },
    ],
    execute,
    query,
  })

import logo from 'src/writeData/clients/CSharp/logo.svg'
import description from 'src/writeData/clients/CSharp/description.md'
import initialize from 'src/writeData/clients/CSharp/initialize.example'
import writeLP from 'src/writeData/clients/CSharp/write.0.example'
import writePoint from 'src/writeData/clients/CSharp/write.1.example'
import writePOCO from 'src/writeData/clients/CSharp/write.2.example'
import execute from 'src/writeData/clients/CSharp/execute.example'
import query from 'src/writeData/clients/CSharp/query.example'

export default register =>
  register({
    id: 'csharp',
    name: 'C#',
    featureFlag: 'client-library--csharp',
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
        title: 'Use POCO and corresponding class to write data',
        code: writePOCO,
      },
    ],
    execute,
    query,
  })

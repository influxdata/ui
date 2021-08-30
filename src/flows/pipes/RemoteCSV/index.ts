import View from './view'
import './styles.scss'
export default register => {
  register({
    type: 'remoteCSV',
    family: 'inputs',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--remote-csv',
    button: 'Remote CSV',
    initial: {
      csvType: '',
      url: '',
      sampleName: '',
    },
    source: data => {
      if (!data.url?.length) {
        return ''
      }
      return data.sampleName === 'Custom'
        ? `import "experimental/csv"
      csv.from(url: "${data.url}")`
        : `import "influxdata/influxdb/sample"
      sample.data(
        set: "${data.sampleName}"
      )`
    },
  })
}

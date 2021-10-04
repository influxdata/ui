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
      const dataQuery =
        data.sampleName === 'Custom'
          ? `import "experimental/csv"
      data = csv.from(url: "${data.url}")`
          : `import "influxdata/influxdb/sample"
      data = sample.data(
        set: "${data.sampleName}"
      )`
      return `${dataQuery}
      min = data |> keep(columns: ["_time"]) |> group() |> min(column: "_time") |> tableFind(fn: (key) => true) |> getRecord(idx: 0)
      max = data |> keep(columns: ["_time"]) |> group() |> max(column: "_time") |> tableFind(fn: (key) => true) |> getRecord(idx: 0)

      data
        |> range(start: min._time, stop: max._time)`
    },
  })
}

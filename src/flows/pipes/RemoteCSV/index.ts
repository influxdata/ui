import {IconFont} from '@influxdata/clockface'
import View from './view'
import './styles.scss'
export default register => {
  register({
    type: 'remoteCSV',
    family: 'inputs',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--remotecsv',
    button: 'Remote CSV',
    description: 'Use a CSV to build your query',
    icon: IconFont.Plus_New,
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
      csvRange = data
          |> keep(columns: ["_time"])
          |> group()
          |> reduce(
              fn: (r, accumulator) => ({
                  min: if r._time < accumulator.min then r._time else accumulator.min,
                  max: if r._time > accumulator.max then r._time else accumulator.max,
              }),
              identity: {min: now(), max: time(v: 0)},
          )
          |> findRecord(fn: (key) => true, idx: 0)

      data
          |> range(start: csvRange.min, stop: csvRange.max)`
    },
  })
}

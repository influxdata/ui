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
    },
    generateFlux: (pipe, create, append) => {
      if (pipe.url?.length) {
        const flux = `import "experimental/csv"
         csv.from(url: "${pipe.url}")
         |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
        `
        create(flux)
        append(`__CURRENT_RESULT__ |> limit(n: 100)`)
      }
    },
  })
}

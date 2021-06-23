import View from './view'
import './styles.scss'
export default register => {
  register({
    type: 'csvImport',
    family: 'inputs',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--csv-import',
    button: 'CSV Import',
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

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
      csvType: 'NOAA National Buoy Data Center (NDBC)',
      url:
        'https://raw.githubusercontent.com/influxdata/influxdb2-sample-data/master/noaa-ndbc-data/latest-observations-annotated.csv',
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

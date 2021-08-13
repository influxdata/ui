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
    source: data => {
      if (!data.url?.length) {
        return ''
      }

      return `import "experimental/csv"
      csv.from(url: "${data.url}")`
    },
  })
}

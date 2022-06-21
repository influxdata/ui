import View from './view'
import ReadOnly from './readOnly'
import './style.scss'
import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

export default register => {
  register({
    type: 'metricSelector',
    family: 'inputs',
    priority: 1,
    component: View,
    readOnlyComponent: ReadOnly,
    button: 'Metric Selector',
    // featureFlag: 'flow-panel--metric-selector',
    initial: {
      field: '',
      measurement: '',
      tags: {},
      aggregateFunction: FUNCTIONS[0],
    },
    source: data => {
      const {bucket, field, measurement, tags} = data

      if (!bucket) {
        return ''
      }
      if (!(field || measurement || Object.values(tags).length)) {
        return ''
      }

      let from = `from(bucket: "${bucket.name}")`
      if (bucket.type === 'sample') {
        from = `import "influxdata/influxdb/sample"
        sample.data(set: "${bucket.id}")`
      }

      let text = `${from}\n\t|> range(start: v.timeRangeStart, stop: v.timeRangeStop)`
      if (measurement) {
        text += ` |> filter(fn: (r) => r["_measurement"] == "${measurement}")`
      }
      if (field) {
        text += ` |> filter(fn: (r) => r["_field"] == "${field}")`
      }
      if (tags && Object.keys(tags)?.length > 0) {
        Object.keys(tags)
          .filter((tagName: string) => !!tags[tagName])
          .forEach((tagName: string) => {
            const tagValues = tags[tagName]
            if (tagValues.length === 1) {
              text += ` |> filter(fn: (r) => r["${tagName}"] == "${tagValues[0]}")`
            } else {
              tagValues.forEach((val, i) => {
                if (i === 0) {
                  text += ` |> filter(fn: (r) => r["${tagName}"] == "${val}"`
                }
                if (tagValues.length - 1 === i) {
                  text += ` or r["${tagName}"] == "${val}")`
                } else {
                  text += ` or r["${tagName}"] == "${val}"`
                }
              })
            }
          })
      }

      return text
    },
  })
}

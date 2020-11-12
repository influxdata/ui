import View from './view'
import './style.scss'
import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

export default register => {
  register({
    type: 'metricSelector',
    family: 'inputs',
    priority: 1,
    component: View,
    button: 'Metric Selector',
    initial: {
      field: '',
      measurement: '',
      tags: {},
      aggregateFunction: FUNCTIONS[0],
    },
    generateFlux: (pipe, create, _append) => {
      const {aggregateFunction, bucket, field, measurement, tags} = pipe
      if (!bucket) {
        return
      }
      let text = `from(bucket: "${bucket.name}") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)`
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

      if (aggregateFunction?.name) {
        text += ` |> aggregateWindow(every: v.windowPeriod, fn: ${aggregateFunction.name}, createEmpty: false)`
      }

      create(text)
    },
  })
}

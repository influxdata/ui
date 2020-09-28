import View from './view'
import './style.scss'
import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

export default register => {
  register({
    type: 'queryBuilder',
    family: 'inputs',
    priority: 1,
    component: View,
    button: 'Metric Selector',
    initial: {
      bucketName: '',
      field: '',
      measurement: '',
      tags: {},
      aggregateFunction: FUNCTIONS[0],
    },
  })
}

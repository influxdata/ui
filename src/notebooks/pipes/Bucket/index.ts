import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'data',
    family: 'inputs',
    priority: 1,
    component: View,
    button: 'Bucket',
    initial: {
      bucketName: '',
    },
  })
}

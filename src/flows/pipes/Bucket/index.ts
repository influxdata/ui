import View from './view'
import '../Data/style.scss'

export default register => {
  register({
    type: 'bucket',
    family: 'output',
    priority: 1,
    component: View,
    button: 'Output to Bucket',
    initial: {
      bucketName: '',
    },
  })
}

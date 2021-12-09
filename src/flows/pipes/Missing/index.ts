import View from './view'
import './styles.scss'

export default register => {
  register({
    type: 'missing',
    family: 'system',
    priority: 1,
    component: View,
    initial: {},
  })
}

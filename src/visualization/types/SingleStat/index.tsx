import icon from './icon'
import properties from './properties'
import {SingleStatOptions} from './options'
import view from './view'

export default register => {
  register({
    type: 'single-stat',
    name: 'Single Stat',
    graphic: icon,
    component: view,
    initial: properties,
    options: SingleStatOptions,
  })
}

import {GaugeIcon} from './icon'
import {GaugeOptions} from './options'
import {GaugeProperties} from './properties'
import {Gauge} from './view'

export const view = {
  type: 'gauge',
  name: 'Gauge',
  graphic: GaugeIcon,
  initial: GaugeProperties,
  component: Gauge,
  options: GaugeOptions,
}

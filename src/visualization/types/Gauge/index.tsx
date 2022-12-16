import {Visualization} from 'src/visualization'
import {GaugeIcon} from './icon'
import {GaugeOptions} from './options'
import {GaugeProperties} from './properties'
import {Gauge} from './view'

export class View implements Visualization {
  type = 'gauge'
  name = 'Gauge'
  graphic = GaugeIcon
  initial = GaugeProperties
  component = Gauge
  options = GaugeOptions
}

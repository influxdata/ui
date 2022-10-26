import {Visualization} from 'src/visualization'
import {ScatterIcon} from './icon'
import {ScatterOptions} from './options'
import {ScatterProperties} from './properties'
import {Scatter} from './view'

export class View implements Visualization {
  type = 'scatter'
  name = 'Scatter'
  graphic = ScatterIcon
  initial = ScatterProperties
  component = Scatter
  options = ScatterOptions
}

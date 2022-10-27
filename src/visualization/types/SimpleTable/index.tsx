import {Visualization} from 'src/visualization'
import {SimpleTableIcon} from './icon'
import {SimpleTableOptions} from './options'
import {SimpleTableProperties} from './properties'
import {SimpleTable} from './view'

export class View implements Visualization {
  type = 'simple-table'
  name = 'Simple Table'
  graphic = SimpleTableIcon
  initial = SimpleTableProperties
  component = SimpleTable
  options = SimpleTableOptions
}

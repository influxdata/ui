import {Visualization} from 'src/visualization'
import {TableIcon} from './icon'
import {TableOptions} from './options'
import {TableProperties} from './properties'
import {Table} from './view'

export class View implements Visualization {
  type = 'table'
  name = 'Table'
  graphic = TableIcon
  initial = TableProperties
  component = Table
  options = TableOptions
}

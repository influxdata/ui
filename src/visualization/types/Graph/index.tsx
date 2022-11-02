import {Visualization} from 'src/visualization'
import {GraphIcon} from './icon'
import {GraphOptions} from './options'
import {GraphProperties} from './properties'
import {Graph} from './view'

export class View implements Visualization {
  type = 'xy'
  name = 'Graph'
  graphic = GraphIcon
  component = Graph
  initial = GraphProperties
  options = GraphOptions
}

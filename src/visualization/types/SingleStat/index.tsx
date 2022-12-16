import {Visualization} from 'src/visualization'
import {SingleStatIcon} from './icon'
import {SingleStatOptions} from './options'
import {SingleStatProperties} from './properties'
import {SingleStat} from './view'

export class View implements Visualization {
  type = 'single-stat'
  name = 'Single Stat'
  graphic = SingleStatIcon
  component = SingleStat
  initial = SingleStatProperties
  options = SingleStatOptions
}

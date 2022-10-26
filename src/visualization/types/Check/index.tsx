import {Visualization} from 'src/visualization'
import {CheckIcon} from './icon'
import {CheckProperties} from './properties'
import {Check} from './view'

export class View implements Visualization {
  type = 'check'
  name = 'Check'
  disabled = true
  graphic = CheckIcon
  component = Check
  initial = CheckProperties
}

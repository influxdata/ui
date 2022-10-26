import {Visualization} from 'src/visualization'
import {BandIcon} from './icon'
import {BandOptions} from './options'
import {BandProperties} from './properties'
import {Band} from './view'

export class View implements Visualization {
  type = 'band'
  name = 'Band'
  graphic = BandIcon
  initial = BandProperties
  component = Band
  options = BandOptions
}

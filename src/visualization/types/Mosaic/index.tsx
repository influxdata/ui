import {Visualization} from 'src/visualization'
import {MosaicIcon} from './icon'
import {MosaicOptions} from './options'
import {MosaicProperties} from './properties'
import {Mosaic} from './view'

export class View implements Visualization {
  type = 'mosaic'
  name = 'Mosaic'
  graphic = MosaicIcon
  component = Mosaic
  initial = MosaicProperties
  options = MosaicOptions
}

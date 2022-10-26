import {MosaicIcon} from './icon'
import {MosaicOptions} from './options'
import {MosaicProperties} from './properties'
import {Mosaic} from './view'

export const view = {
  type: 'mosaic',
  name: 'Mosaic',
  graphic: MosaicIcon,
  component: Mosaic,
  initial: MosaicProperties,
  options: MosaicOptions,
}

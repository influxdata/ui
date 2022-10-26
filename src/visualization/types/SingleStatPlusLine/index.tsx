import {SingleStatPlusLineIcon} from './icon'
import {SingleStatPlusLineOptions} from './options'
import {SingleStatPlusLineProperties} from './properties'
import {SingleStatPlusLine} from './view'

export const view = {
  type: 'line-plus-single-stat',
  name: 'Graph + Single Stat',
  graphic: SingleStatPlusLineIcon,
  initial: SingleStatPlusLineProperties,
  component: SingleStatPlusLine,
  options: SingleStatPlusLineOptions,
}

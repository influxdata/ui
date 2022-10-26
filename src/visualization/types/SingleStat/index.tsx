import {SingleStatIcon} from './icon'
import {SingleStatOptions} from './options'
import {SingleStatProperties} from './properties'
import {SingleStat} from './view'

export const view = {
  type: 'single-stat',
  name: 'Single Stat',
  graphic: SingleStatIcon,
  component: SingleStat,
  initial: SingleStatProperties,
  options: SingleStatOptions,
}

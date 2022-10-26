import {ScatterIcon} from './icon'
import {ScatterOptions} from './options'
import {ScatterProperties} from './properties'
import {Scatter} from './view'

export const view = {
  type: 'scatter',
  name: 'Scatter',
  graphic: ScatterIcon,
  initial: ScatterProperties,
  component: Scatter,
  options: ScatterOptions,
}

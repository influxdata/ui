import {HistogramIcon} from './icon'
import {HistogramOptions} from './options'
import {HistogramProperties} from './properties'
import {Histogram} from './view'

export const view = {
  type: 'histogram',
  name: 'Histogram',
  graphic: HistogramIcon,
  initial: HistogramProperties,
  component: Histogram,
  options: HistogramOptions,
}

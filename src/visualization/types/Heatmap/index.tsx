import {HeatmapIcon} from './icon'
import {HeatmapOptions} from './options'
import {HeatmapProperties} from './properties'
import {Heatmap} from './view'

export const view = {
  type: 'heatmap',
  name: 'Heatmap',
  graphic: HeatmapIcon,
  initial: HeatmapProperties,
  component: Heatmap,
  options: HeatmapOptions,
}

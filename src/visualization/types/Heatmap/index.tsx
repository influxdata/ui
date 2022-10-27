import {Visualization} from 'src/visualization'
import {HeatmapIcon} from './icon'
import {HeatmapOptions} from './options'
import {HeatmapProperties} from './properties'
import {Heatmap} from './view'

export class View implements Visualization {
  type = 'heatmap'
  name = 'Heatmap'
  graphic = HeatmapIcon
  initial = HeatmapProperties
  component = Heatmap
  options = HeatmapOptions
}
